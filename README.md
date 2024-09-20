# NTUA ECE SAAS 2024 Project

Implements a SaaS-based math-solving web application for the Ece Ntua SaaS 2023-24 course. The project is structured around multiple microservices, allowing users to solve complex mathematical problems by purchasing credits and utilizing computational resources. Each microservice handles a distinct aspect of the application, such as problem-solving logic, credit management, and user interaction.

## Table of Contents
1. [Contributors](#contributors-team-30)
2. [Tech Stack](#tech-stack)
3. [Microservices](#microservices)
4. [Documentation](#documentation)
5. [Getting Started](#getting-started)
6. [Endpoints](#endpoints)
7. [License](#license)

## Contributors
- [Chatzilia Iliana](https://github.com/ntua-el19155)
- [Karam Konstantinos](https://github.com/ntua-el19808)
- [Kolios Apostolos](https://github.com/ntua-el19904)
- [Ntontoros Ilias](https://github.com/ntua-el19206)

## Tech Stack
- **Backend**: NodeJS, ExpressJS, Python
- **Frontend**: ReactJS
- **Database**: MongoDB

## Microservices

- [**client**](client): Handles the user interface and interactions.
- [**credit-manager**](credit-manager): Manages user credits and transactions.
- [**solver-manager**](solver-manager): Coordinates solving processes.
- [**submissions-management**](submissions-management): Manages the lifecycle of user submissions.
- [**submissions-results**](submissions-results): Manages the results of submissions.
- [**or-tools**](OR-Tools): Provides the solutions to complex mathematical problems.

## Documentation
Inside the `documentation` folder, you will find the following folders:

- [**JMeter**](documentation/jmeter): Results from Apache JMeter stress tests.
- [**Visual Paradigm**](documentation/Visual%20Paradigm): Component, deployment, sequence, and class diagrams.
- [**AI-Log**](documentation/ai-log): AI logs with prompts.

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository**:
    ```sh
    git clone https://github.com/apostolos-k/ntua-saas-project.git
    cd saas2024-30
    ```

2. **Set up the environment**:
    Ensure you have Docker and Docker Compose installed on your system.

3. **Build and run the services**:
    ```sh
    docker-compose up --build
    ```

4. **Access the application**:
    The client application should be accessible at [http://localhost:3000](http://localhost:3000).

## Endpoints

| Title                   | Method | URL                      | File                       | Microservice            | Description                           |
|-------------------------|--------|--------------------------|----------------------------|-------------------------|---------------------------------------|
| Get Credits             | GET    | http://localhost:7500    | /credit                    | credit-manager          | Retrieves user credits                |
| Change Credits          | POST   | http://localhost:7500    | /credit                    | credit-manager          | Modifies user credits                 |
| New Submission          | POST   | http://localhost:9500    | /new_submission            | or-tools                | Starts the computation of the solution|
| Kill Submission         | POST   | http://localhost:9500    | /kill_submission           | or-tools                | Terminates the ongoing computation of the solution |
| New Solver              | POST   | http://localhost:8500    | /solver                    | solver-manager          | Adds a new solver                     |
| Get Solver              | GET    | http://localhost:8500    | /solver?solverID           | solver-manager          | Retrieves a solver                    |
| Get Solver File         | GET    | http://localhost:8500    | /solver/file?solverID      | solver-manager          | Retrieves a solver file               |
| Get All Solvers         | GET    | http://localhost:8500    | /solver/getall             | solver-manager          | Retrieves all solvers                 |
| Get All Submissions     | GET    | http://localhost:5500    | /allsubmissions            | submission-results      | Retrieves all submissions             |
| Get Submission          | GET    | http://localhost:5500    | /getsubmission?submissionID| submission-results      | Retrieves a specific submission       |
| Delete Submission       | POST   | http://localhost:5500    | /deletesubmission          | submission-results      | Deletes a submission                  |
| Healthcheck             | GET    | http://localhost:6500    | /healthcheck               | submissions-management  | Server healthcheck                    |
| New Submission          | POST   | http://localhost:6500    | /new-submission            | submissions-management  | Creates a new submission              |
| Edit Submission         | POST   | http://localhost:6500    | /editsubmission            | submissions-management  | Edits an existing submission          |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
