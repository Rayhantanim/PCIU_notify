import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import NoticeForm from './AddNoticeForm';

export default function AlertDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <div className='w-60 h-12 text-center font-bold py-2 bg-white border rounded' onClick={handleClickOpen}>
        <div >
                    <p> + ADD New Notice</p>
                   </div>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        role="alertdialog"
      >
  
        <DialogContent>
          <NoticeForm handleClose={handleClose} />
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
