import React from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CircularProgress, {
  CircularProgressProps,
} from '@material-ui/core/CircularProgress';
import { indigo } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    bottom: {
      color: indigo[200],
    },
    top: {
      // color: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
      color: theme.palette.background.default,
      animationDuration: '800ms',
      position: 'absolute',
      left: 0,
    },
    circle: {
      strokeLinecap: 'round',
    },
  })
);

function ProgressCircular(props: CircularProgressProps) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CircularProgress
        variant="determinate"
        className={classes.bottom}
        size={16}
        thickness={8}
        value={100}
        {...props}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        className={classes.top}
        classes={{
          circle: classes.circle,
        }}
        size={16}
        thickness={8}
        {...props}
      />
    </div>
  );
}

export default ProgressCircular;
