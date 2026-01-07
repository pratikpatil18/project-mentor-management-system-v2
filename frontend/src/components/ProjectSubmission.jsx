import React, { useState, useEffect } from 'react';
import api from "../api";   

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
      const response = await api.post('/projects', {
        title: projectData.title,
        description: projectData.description,
        student_id: studentId,
        mentor_id: mentorId,
      });

      setLoading(false);
      
      if (onSubmissionSuccess) {
        onSubmissionSuccess(response.data);
      }
      
      setProjectData({ title: '', description: '' });
      
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit project proposal');
      console.error('Error submitting project:', err);
    }
  };

 
};

export default ProjectSubmission; 