import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import MediaCard from "./Card";

export default function NoticeTabs() {
  const [notices, setNotices] = React.useState([]);
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    fetch("/notices.json")
      .then((res) => res.json())
      .then((data) => setNotices(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Helper function to filter notices by type
  const getNoticesByType = (type) =>
    notices.filter((notice) => notice.type === type);

  return (
    <Box className="mx-auto" sx={{ width: "100%" }}>
      {/* Tabs */}
      <Tabs value={value} onChange={handleChange}>
        <Tab label="General" />
        <Tab label="Teachers" />
        <Tab label="Staff" />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ p: 3 }}>
        {value === 0 &&
          getNoticesByType("general").map((notice) => (
           <MediaCard notice={notice}></MediaCard>
          ))}
        {value === 1 &&
          getNoticesByType("teacher").map((notice) => (
            <MediaCard notice={notice}></MediaCard>
          ))}
        {value === 2 &&
          getNoticesByType("staff").map((notice) => (
             <MediaCard notice={notice}></MediaCard>
          ))}
      </Box>
    </Box>
  );
}