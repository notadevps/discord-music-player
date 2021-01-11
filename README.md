
Discord Music Player
a music player based on discord.js [link](https://discord.js.org/#/)\
with typescript support 

# Quickstart

make a file in an IDE of your choice
you can start with
```
const discord = require('discord.js');
const client = new discord.Client();
const { Player } = require ('discord-music-player');
const player = new Player(client);
```
you can listen on some events on Player 

# Events 
queueCreated -> when a queue is created\
trackEnded -> when a track is ended\
queueEnded -> when ther is no tracks to play\ 
trackAdded -> when a  track is added  in queue\
error -> error occured
