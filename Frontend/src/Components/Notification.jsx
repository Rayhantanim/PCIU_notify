import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function SimpleBadge() {
  return (
   <div>
     <Badge badgeContent={4} color="primary">
      <div >
        <NotificationsIcon color="action" />
      </div>
    </Badge>
   </div>
  );
}
