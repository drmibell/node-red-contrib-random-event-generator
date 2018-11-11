# node-red-contrib-random-event-generator
A Node-RED node for generating events at random intervals.
## Install
Either use the Manage Palette option in the Node-RED Editor menu, or run the following command in your Node-RED user directory (typically `~/.node-red`):

    npm install node-red-contrib-random-event-generator
## Usage
This node generates events (messages) at intervals drawn from a random distribution. By default, an exponential distribution is used, where the probability of a given interval between events is an exponentially decreasing function of the length of the interval. This is the behaviour displayed by radioactive decays, noise in electronic devices, and other physical phenomena. Alternatively, the distribution can be chosen to be uniform in a selected range.

The user can specify the average interval for the exponential distribution and the minimum and maximum intervals for the uniform distribution. Negative inputs are replaced by their absolute values.

Messages with the topic <code>Control Topic</code> are control messages, which toggle 
the generator on or off. The output messages have a user-defined topic (default: `event`) and payload (default: `timestamp`) and the additional property `msg.delay`, which is the time since the previous event.

The node has been useful in testing the operation of message queues and in Monte-Carlo simulation of physical systems.
# Node status
The state of the node is indicated by a status object, a red dot when the generator is stopped and a green dot with the value of the current interval when it is running.
## Examples
This flow demonstrates the basic operation of the `event` node. The average interval between events is calculated with `node-red-contrib-statistics`. This can be omitted, but the user may be interested in seeing how quickly the average converges to its expected value.
```
[{"id":"24a72f57.5327e8","type":"inject","z":"6f10feeb.9097f8","name":"start/stop","topic":"control","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":80,"wires":[["371a8a7f.53a956"]]},{"id":"2cc4ce7e.b0853a","type":"debug","z":"6f10feeb.9097f8","name":"","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"delay","x":430,"y":60,"wires":[]},{"id":"371a8a7f.53a956","type":"event","z":"6f10feeb.9097f8","name":"","controlTopic":"control","meanInterval":"1","distribution":"exponential","minInterval":"1","maxInterval":"2","outputTopic":"event","outputPayload":"timestamp","x":270,"y":80,"wires":[["2cc4ce7e.b0853a","4a1659df.b68d"]]},{"id":"bf964625.93036","type":"debug","z":"6f10feeb.9097f8","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":730,"y":100,"wires":[]},{"id":"4a1659df.b68d","type":"change","z":"6f10feeb.9097f8","name":"mean","rules":[{"t":"set","p":"topic","pt":"msg","to":"data/mean","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":410,"y":100,"wires":[["124accec.44cf1b"]]},{"id":"124accec.44cf1b","type":"statistics","z":"6f10feeb.9097f8","name":"mean delay","dataSetSize":0,"inputField":"delay","inputFieldType":"msg","resultField":"payload","resultFieldType":"msg","parameterField":"","parameterFieldType":"payload","stripFunction":false,"resultOnly":true,"x":570,"y":100,"wires":[["bf964625.93036"]]},{"id":"d9a3ebaf.c283b","type":"inject","z":"6f10feeb.9097f8","name":"clear","topic":"clear","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":410,"y":140,"wires":[["124accec.44cf1b"]]}]
```
<img src="https://github.com/drmibell/node-red-contrib-random-event-generator/blob/master/screenshots/event-demo.png?raw=true"/>

