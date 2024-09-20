import os
import json
import signal
import threading
from flask import Flask, request, jsonify
from flask_cors import cross_origin
import pymongo
import requests
import subprocess

mongo_url= os.getenv('MONGO_URL', 'mongodb://localhost:27017')
myclient = pymongo.MongoClient(mongo_url)
mydb = myclient["saas"]
submissions = mydb["submissions"]
app = Flask(__name__)

active_submissions = {}
submission_semaphore = threading.Semaphore(5)  # Limit to 5 concurrent submissions


def handle_submission(submissionID, parameters):
    submission_semaphore.acquire()
    try:
        proc = subprocess.Popen(parameters, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        active_submissions[submissionID] = proc
        outs, errs = proc.communicate()
        proc.wait()
        active_submissions.pop(submissionID, None)

        if proc.returncode == 0:
            submissions.find_one_and_update({"_id": submissionID}, { '$set': { "status" : "Finished", "results" : outs.decode('utf-8') } })
        else:
            submissions.find_one_and_update({"_id": submissionID}, { '$set': { "status" : "Failed", "results" : errs.decode('utf-8') if errs else 'Unknown error occurred' } })
    except Exception as e:
        submissions.find_one_and_update({"_id": submissionID}, { '$set': { "status" : "Failed", "results" : str(e) } })
    finally:
        submission_semaphore.release()


@app.route('/new_submission', methods=['POST'])
def new_submission():
    solver_manager_url = os.getenv('SOLVER_MANAGER_URL', 'http://localhost:8500')

    
    try:
        submissionID = request.form.get('submissionID')
        solverID =  request.form.get('solverID')
        if(solverID is None):
            solverID = "vrpSolver"
        solverDetails = requests.get(f"{solver_manager_url}/solver", params={"solverID":solverID})
        solver = requests.get(f"{solver_manager_url}/solver/file", params={"solverID":solverID})
        if (solverDetails.status_code!=200 or solver.status_code!=200):
            submissions.find_one_and_update({"_id":submissionID}, { '$set': { "status" : "Failed"} })
            submissions.find_one_and_update({"_id":submissionID}, { '$set': { "results" : "Solver could not be found there may be a problem with the Solver-Manager"} })
            return jsonify({'message':'Solver could not be found there may be a problem with the Solver-Manager'}), 200
        parameters = []
        parameters.append("python")
        parameters.append("-c")
        parameters.append(solver.text)
    
        solverDetails = json.loads(solverDetails.text)

        for input in solverDetails["metadata"]:
            if (solverDetails["metadata"][input]== 'File'):
                file = request.files['file']
                file.save(os.path.join(os.getcwd(),"files/" + submissionID + ".json"))
                parameters.append("files/" + submissionID + ".json")
            else:
                parameters.append(request.form.get(input))

        threading.Thread(target=handle_submission, args=(submissionID, parameters), daemon=True).start()

    except Exception as e:
        submissions.find_one_and_update({"_id":submissionID}, { '$set': { "status" : "Failed"} })

        submissions.find_one_and_update({"_id":submissionID}, { '$set': { "results" : "An error has occured please try again"} })

        return jsonify({'error': str(e)}), 400


    return str("received")


@app.route('/kill_submission', methods=['POST'])
@cross_origin()
def kill_submission():
    try:
        submissionID = request.args.get("submissionID")
        proc = active_submissions.pop(submissionID, None)

        if proc is not None:
            proc.terminate()
            submissions.find_one_and_update({"_id": submissionID}, { '$set': { "status" : "Failed", "results" : "Submission was stopped by the user." } })
        else:
            return jsonify({ "message": "Submission already finished or does not exist." }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    return jsonify({ "message": "Submission stopped successfully." }), 200

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=9500)