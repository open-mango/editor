import React from 'react';
import mime from 'mime-types';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { IconButton, Paper } from '@material-ui/core';

import CancelRoundedIcon from '@material-ui/icons/CancelRounded';

import ProgressCircular from './ProgressCircular';

export interface UploadFile extends File {
  uploaded: boolean;
  url: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    uploadContainer: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1),
    },
    previewContainer: {
      position: 'relative',
    },
    preview: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: theme.shape.borderRadius,
      border: '1px solid #ccc',
      margin: 4,
    },
    noImage: {
      position: 'relative',
      height: '58px',
      borderRadius: theme.shape.borderRadius,
      border: '1px solid #ccc',
      padding: theme.spacing(1),
      margin: 4,
    },
    previewState: {
      position: 'absolute',
      top: -4,
      right: -4,
    },
    close: {
      padding: 1,
      backgroundColor: theme.palette.primary.light,
    },
    fileInfoContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    fileInfo: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface PreviewProps {
  previews?: UploadFile[];
  onRemovePreview?: (id: number) => void;
}

function Preview({ previews, onRemovePreview }: PreviewProps) {
  const classes = useStyles();

  if (previews === undefined || previews.length < 1) return null;

  return (
    <div className={classes.uploadContainer}>
      {previews.map((file, index) => {
        const isImage = file.type.startsWith('image/');
        const progress = file.uploaded ? (
          <IconButton
            size="small"
            classes={{
              root: classes.close,
            }}
            onClick={() => onRemovePreview && onRemovePreview(index)}
          >
            <CancelRoundedIcon style={{ color: '#ccc' }} />
          </IconButton>
        ) : (
          <ProgressCircular />
        );

        if (isImage) {
          return (
            <div key={index} className={classes.previewContainer}>
              <img className={classes.preview} src={file.url} alt="preview" />
              <div className={classes.previewState}>{progress}</div>
            </div>
          );
        } else {
          const ext = mime.extension(file.type);
          return (
            <Paper key={index} elevation={0} className={classes.noImage}>
              <div className={classes.fileInfoContainer}>
                <img
                  src={require(`./images/mime_icons/${ext}.svg`)}
                  alt={`${ext} file`}
                  height="40"
                />
                <div className={classes.fileInfo}>
                  <div>{file.name}</div>
                  <div>{file.size}</div>
                </div>
              </div>
              <div className={classes.previewState}>{progress}</div>
            </Paper>
          );
        }
      })}
    </div>
  );
}

export default Preview;
