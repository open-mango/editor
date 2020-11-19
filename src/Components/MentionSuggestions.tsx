import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@material-ui/core';

import Brightness1RoundedIcon from '@material-ui/icons/Brightness1Rounded';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${theme.palette.grey[300]}`,
      borderRadius: theme.shape.borderRadius,
      maxHeight: 200,
      overflowY: 'scroll',
    },
  })
);

export interface Mention {
  id: number;
  name: string;
  avatar?: string;
  email?: string;
  online: boolean;
}

type MentionSuggestionsProps = {
  suggestions: Mention[];
  search: string;
  onSelect: (mention: Mention) => void;
};

function MentionSuggestions(props: MentionSuggestionsProps) {
  const classes = useStyles();
  const { suggestions, search, onSelect } = props;

  const targets = suggestions.filter(s => s.name.includes(search));

  if (targets.length < 1) return null;

  return (
    <div className={classes.root}>
      <List component="nav" aria-labelledby="suggestions">
        {targets.map(user => (
          <ListItem key={user.id} button onClick={() => onSelect(user)}>
            <ListItemIcon>
              <Avatar src={user.avatar} />
            </ListItemIcon>
            <ListItemText primary={user.name} />
            <ListItemSecondaryAction>
              <Brightness1RoundedIcon
                color={user.online ? 'secondary' : 'disabled'}
                fontSize="small"
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default MentionSuggestions;
