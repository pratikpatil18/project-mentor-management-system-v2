import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ProjectChat from "../components/MessageChat";   // or correct path
import { Sheet, Typography, Button, Table, Divider, Chip, Modal, ModalDialog, Link, Box, Textarea, FormControl, FormLabel, Stack, IconButton} from '@mui/joy';
import Navbar from "../components/Navbar";



const MentorPanel = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [actionType, setActionType] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatProject, setChatProject] = useState(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [mentorProfile, setMentorProfile] = useState(null);
  const [students, setStudents] = useState([]);



  
  useEffect(() => {
    fetchMentorProjects();

    const userData = JSON.parse(localStorage.getItem("userData"));
    setMentorProfile(userData);

    if (!userData) return;

    // Always use the correct mentor id
    const mentorId = userData.mentor_id || userData.id;

    axios
      .get(`http://127.0.0.1:5000/faculty/mentor/${mentorId}/students`)
      .then(res => setStudents(res.data))
      .catch(err => {
        console.error("Failed to load mentor students", err);
        setStudents([]);
      });
  }, []);


    



  
  const fetchMentorProjects = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const response = await axios.get(`http://127.0.0.1:5000/faculty/projects/${userData.id}`);
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };
  
  const handleAction = (project, action) => {
    setSelectedProject(project);
    setActionType(action);
    setFeedback('');
    setActionModalOpen(true);
  };

  const openChat = (project) => {
    setChatProject(project);
    setShowChat(true);
  };

  
  const submitAction = async () => {
    try {
      if (!selectedProject) return;
      
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      // If it's just providing feedback, use a different endpoint that only updates feedback
      if (actionType === 'feedback') {
        const feedbackEndpoint = `http://127.0.0.1:5000/projects/${selectedProject.id}`;
        const feedbackPayload = {
          mentor_feedback: feedback
        };
        
        await axios.put(feedbackEndpoint, feedbackPayload);
      } else {
        // For approve/reject actions, use the status update endpoint
        const endpoint = `http://127.0.0.1:5000/faculty/projects/${selectedProject.id}/status`;
        
        const payload = {
          mentor_id: userData.id,
          status: actionType === 'approve' ? 'Approved' : 'Rejected',
          feedback: feedback
        };
        
        await axios.put(endpoint, payload);
        
        // Update the project status locally only for approve/reject actions
        setProjects(projects.map(project => 
          project.id === selectedProject.id 
            ? { ...project, status: actionType === 'approve' ? 'Approved' : 'Rejected' } 
            : project
        ));
      }
      
      setActionModalOpen(false);
      setSelectedProject(null);
      setFeedback('');
      
      // Refresh projects data
      fetchMentorProjects();
      
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again.');
    }
  };
  
  const containerStyle = {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const renderProfileTab = () => {
    if (!mentorProfile) return <Typography>Loading profile...</Typography>;

    return (
      <Box sx={{ bgcolor: "#222", p: 3, borderRadius: "8px", color: "white" }}>
        <Typography level="h3" sx={{ color: "#e50914", mb: 3 }}>
          Your Profile
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ color: "#aaa" }}>Name</Typography>
          <Typography>{mentorProfile.name}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ color: "#aaa" }}>Email</Typography>
          <Typography>{mentorProfile.email}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ color: "#aaa" }}>Department</Typography>
          <Typography>{mentorProfile.department}</Typography>
        </Box>
      </Box>
    );
  };

  
  return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh" }}>
      <Navbar />

      <div style={containerStyle}>

      <Sheet sx={{ p: 4, borderRadius: 'md', mb: 3, bgcolor: "#111" }}>

        {/* Top row: Title + Logout */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2
        }}>
          <Typography level="h3" sx={{ color: "white" }}>
            Mentor Dashboard
          </Typography>

          <Button
            sx={{
              bgcolor: "#e50914",
              color: "white",
              "&:hover": { bgcolor: "#b2070e" }
            }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        {/* Tabs row */}
        <Box sx={{ display: "flex", gap: 4, borderBottom: "1px solid #333", mb: 3 }}>
          <Box
            onClick={() => setActiveTab("projects")}
            sx={{
              cursor: "pointer",
              pb: 1,
              fontWeight: "bold",
              color: activeTab === "projects" ? "white" : "#aaa",
              borderBottom: activeTab === "projects" ? "3px solid #e50914" : "none"
            }}
          >
            Projects
          </Box>

          <Box
            onClick={() => setActiveTab("students")}
            sx={{
              cursor: "pointer",
              pb: 1,
              fontWeight: "bold",
              color: activeTab === "students" ? "white" : "#aaa",
              borderBottom: activeTab === "students" ? "3px solid #e50914" : "none"
            }}
          >
            All Students
          </Box>

          <Box
            onClick={() => setActiveTab("profile")}
            sx={{
              cursor: "pointer",
              pb: 1,
              fontWeight: "bold",
              color: activeTab === "profile" ? "white" : "#aaa",
              borderBottom: activeTab === "profile" ? "3px solid #e50914" : "none"
            }}
          >
            Profile
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
          {activeTab === "projects" && (
            <>
              {loading ? (
                <Typography>Loading projects...</Typography>
              ) : error ? (
                <Typography color="danger">{error}</Typography>
              ) : projects.length === 0 ? (
                <Typography>No projects assigned yet.</Typography>
              ) : (
                <Table> 
            <thead>
                        <tr>
                          <th>Project Title</th>
                          <th>Student</th>
                          <th>Status</th>
                          <th>GitHub Link</th>
                          <th>Last Updated</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project) => (
                          <tr key={project.id}>
                            <td>{project.title}</td>
                            <td>{project.student_name}</td>
                            <td>
                              <Chip 
                                color={
                                  project.status === 'Approved' ? 'success' : 
                                  project.status === 'Rejected' ? 'danger' :
                                  project.status === 'In Progress' ? 'primary' : 'warning'
                                }
                              >
                                {project.status}
                              </Chip>
                            </td>
                            <td>
                              {project.github_link ? (
                                <a
                                  href={project.github_link.startsWith("http")
                                    ? project.github_link
                                    : "https://" + project.github_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#1976d2", textDecoration: "underline" }}
                                >
                                  View Repository
                                </a>
                              ) : (
                                <Typography level="body-sm" color="neutral">
                                  Not provided yet
                                </Typography>
                              )}
                            </td>
                            <td>
                              {project.last_updated
                                ? new Date(project.last_updated).toLocaleDateString()
                                : "—"}
                            </td>
                            <td>
                              {((project.status || 'Pending') === 'Pending' || (project.status || 'Pending') === 'Submitted') && (
                                <>
                                  <Button 
                                    size="sm" 
                                    color="success" 
                                    sx={{ mr: 1, mb: 1 }}
                                    onClick={() => handleAction(project, 'approve')}
                                  >
                                    Approve
                                  </Button>

                                  <Button 
                                    size="sm" 
                                    color="danger"
                                    sx={{ mb: 1 }}
                                    onClick={() => handleAction(project, 'reject')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}

                              {project.status === 'Approved' && (
                                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                  <Button 
                                    size="sm" 
                                    color="primary"
                                    onClick={() => handleAction(project, 'feedback')}
                                  >
                                    Provide Feedback
                                  </Button>

                                  <IconButton
                                    size="sm"
                                    variant="soft"
                                    color="danger"
                                    onClick={() => openChat(project)}
                                    sx={{
                                      borderRadius: "50%",
                                      minWidth: 32,
                                      height: 32,
                                      p: 0
                                    }}
                                  >
                                    <ChatBubbleOutlineIcon />
                                  </IconButton>
                                </Box>
                              )}
                            </td>

                          </tr>
                        ))}
                      </tbody> 
            </Table>
              )}
            </>
          )}

          {activeTab === "students" && (
            <Box
              sx={{
                bgcolor: "#111",
                p: 3,
                borderRadius: "md",
                color: "white"
              }}
            >
              <Typography level="h4" sx={{ color: "#e50914", mb: 2 }}>
                Assigned Students
              </Typography>

              {students.length === 0 ? (
                <Typography>No students assigned to you.</Typography>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>PRN</th>
                      <th>Email</th>
                      <th>GitHub</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.student_id}>
                        <td>{s.name}</td>
                        <td>{s.prn}</td>
                        <td>{s.email}</td>
                        <td>
                          {s.github_link ? (
                            <a
                              href={s.github_link.startsWith("http")
                                ? s.github_link
                                : "https://" + s.github_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#1976d2" }}
                            >
                              View
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Box>
          )}


          {activeTab === "profile" && mentorProfile && (
            <Box sx={{
              bgcolor: "#1c1c1c",
              p: 3,
              borderRadius: "md",
              color: "white",
              maxWidth: 500
            }}>
              <Typography level="h4" sx={{ color: "#e50914", mb: 2 }}>
                Your Profile
              </Typography>

              <Typography><b>Name:</b> {mentorProfile.name}</Typography>
              <Typography><b>Email:</b> {mentorProfile.email}</Typography>
              <Typography><b>Department:</b> {mentorProfile.department}</Typography>
            </Box>
          )}

      </Sheet>
      
      {/* Action Modal */}
      <Modal open={actionModalOpen} onClose={() => setActionModalOpen(false)}>
        <ModalDialog
          aria-labelledby="action-modal-title"
          sx={{ maxWidth: 500 }}
        >
          <Typography id="action-modal-title" level="h4">
            {actionType === 'approve' ? 'Approve Project' : 
             actionType === 'reject' ? 'Reject Project' : 'Provide Feedback'}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {selectedProject && (
            <Box sx={{ mb: 2 }}>
              <Typography level="body-lg" fontWeight="bold">
                Project: {selectedProject.title}
              </Typography>
              <Typography level="body-sm">
                Student: {selectedProject.student_name}
              </Typography>
            </Box>
          )}
          
          <FormControl>
            <FormLabel>Feedback for student</FormLabel>
            <Textarea
              placeholder="Enter your feedback..."
              minRows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              sx={{ mb: 2 }}
            />
          </FormControl>
          
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setActionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitAction}
              color={
                actionType === 'approve' ? 'success' : 
                actionType === 'reject' ? 'danger' : 'primary'
              }
            >
              {actionType === 'approve' ? 'Approve' : 
               actionType === 'reject' ? 'Reject' : 'Submit Feedback'}
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>



      {showChat && chatProject && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 400,
            height: 580,
            bgcolor: "#111",
            borderRadius: "12px",
            boxShadow: "0 0 40px rgba(0,0,0,0.8)",
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "#000",
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #333"
            }}
          >
            <Typography sx={{ color: "white", fontWeight: "bold" }}>
              {chatProject.title}
            </Typography>
            <Button size="sm" variant="plain" onClick={() => setShowChat(false)}>
              Close
            </Button>
          </Box>

          {/* Chat body */}
          <Box sx={{ flex: 1 }}>
            <ProjectChat
              projectId={chatProject.id}
              userId={JSON.parse(localStorage.getItem("userData"))?.id}
              userType="mentor"
              embedded={true}      // 🔥 THIS is the fix
            />
          </Box>
        </Box>
      )}


    </div>
    </div>
    
  );
};

export default MentorPanel; 