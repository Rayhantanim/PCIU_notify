import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip
} from "@mui/material";

export default function HomePage() {
  return (
    <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <Container sx={{ mt: 6 }}>
        <Card
          sx={{
            p: 5,
            borderRadius: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #263640, #3f5c6e)",
            color: "white",
            boxShadow: 4
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Smart Campus Notification System
          </Typography>

          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Get real-time notices, class routines, and academic updates in one place.
          </Typography>

          <Button
            variant="contained"
            sx={{ mt: 3, px: 4, py: 1.2, borderRadius: "20px" }}
          >
            Explore Now
          </Button>
        </Card>
      </Container>

      {/* Notice + Routine Section */}
      <Container sx={{ mt: 6 }}>
        <Grid container spacing={4}>

          {/* Notice Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" fontWeight="bold">
                    Latest Notices
                  </Typography>
                  <Chip label="New" color="error" />
                </Box>

                <List>
                  <ListItem divider>
                    <ListItemText
                      primary="Mid Exam Schedule Published"
                      secondary="2 hours ago"
                    />
                  </ListItem>

                  <ListItem divider>
                    <ListItemText
                      primary="Class Suspension Tomorrow"
                      secondary="Yesterday"
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="New Assignment Uploaded"
                      secondary="2 days ago"
                    />
                  </ListItem>
                </List>

                <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                  View All Notices
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Routine Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Class Routine
                </Typography>

                <List>
                  <ListItem divider>
                    <ListItemText
                      primary="Sunday"
                      secondary="OOP (10:00 AM - 11:30 AM)"
                    />
                  </ListItem>

                  <ListItem divider>
                    <ListItemText
                      primary="Monday"
                      secondary="Data Structures (12:00 PM - 1:30 PM)"
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Tuesday"
                      secondary="Database (2:00 PM - 3:30 PM)"
                    />
                  </ListItem>
                </List>

                <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                  View Full Routine
                </Button>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ mt: 8, py: 3, textAlign: "center", background: "#263640", color: "white" }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} PCIU Notify. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}