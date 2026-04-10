import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function MediaCard({notice}) {
  return (
    <Card className='my-2 mx-auto' sx={{ maxWidth: 600 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {notice.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {notice.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">React</Button>
        <Button size="small">Comment</Button>
      </CardActions>
    </Card>
  );
}
