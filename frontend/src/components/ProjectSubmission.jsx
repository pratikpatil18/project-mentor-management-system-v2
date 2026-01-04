import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectSubmission = ({ studentId, mentorId, onSubmissionSuccess }) => {
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!projectData.title || !projectData.description) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/projects', {
        title: projectData.title,
        description: projectData.description,
        student_id: studentId,
        mentor_id: mentorId,
      });

      setLoading(false);
      
      if (onSubmissionSuccess) {
        onSubmissionSuccess(response.data);
      }
      
      // Clear form after successful submission
      setProjectData({ title: '', description: '' });
      
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit project proposal');
      console.error('Error submitting project:', err);
    }
  };

 
};

export default ProjectSubmission; 