import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './Landing';
import Submissions from "./Submissions";
import NewSubmission from "./NewSubmission";
import NotFound from './NotFound';
import ViewSubmission from "./ViewSubmission";
import SubmissionResults from "./SubmissionResults";

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/submissions" element={<Submissions />} />
              <Route path="/new-submission" element={<NewSubmission />} />
              <Route path="/view-submission/:id" element={<ViewSubmission />} />
              <Route path="/submission-results/:id" element={<SubmissionResults />} />
              <Route path="*" element={<NotFound />} />
          </Routes>
      </Router>
  );
}

export default App;
