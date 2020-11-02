# node-red-contrib-random-event-generator
A Node-RED node for generating events at random intervals.
## Install
Either use the Manage Palette option in the Node-RED Editor menu or run the following command in your Node-RED user directory (typically `~/.node-red`):

    npm install node-red-contrib-random-event-generator
## Usage
This node generates events (messages) at intervals drawn from a random distribution. By default, an exponential distribution is used, where the probability of a given interval between events is an exponentially decreasing function of the length of the interval. This is the behaviour displayed by radioactive decays, noise in electronic devices, and other physical phenomena. Alternatively, the distribution can be chosen to be uniform in a selected range.

The user can specify the average interval for the exponential distribution and the minimum and maximum intervals for the uniform distribution. Negative inputs are replaced by their absolute values.

Messages with the topic <code>Control Topic</code> are control messages, which can start or stop the generator, depending on the `msg.payload`. Payloads representing `start` and `stop` are (case-insensitive) strings defined by the user when the node is deployed. If a control message is received with a payload that is a number or boolean, the payload is converted to a string and then tested against the command definitions. Any command not recognized as `start` or `stop` will toggle the state of the generator.

The output messages have a user-defined topic (default: `event`) and payload (default: `timestamp`) and the additional property `msg.delay`, which is the time since the previous event.

The node has been useful in testing the operation of message queues and in Monte-Carlo simulation of physical systems.

## Node status
The state of the node is indicated by a status object, a red ring when the generator is stopped and a green dot with the value of the current interval when it is running.
## Examples
This flow demonstrates the basic operation of the `event` node. The average interval between events is calculated with `node-red-contrib-statistics`. This can be omitted, but the user may be interested in seeing how quickly the average converges to its expected value.
```
[{"id":"736c96e8.5b772","type":"inject","z":"3ab2cdb4.c961ba","name":"toggle","props":[{"p":"topic","vt":"str"},{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"control","payload":"toggle","payloadType":"str","x":170,"y":180,"wires":[["5c3b1ea5.d3edf8"]]},{"id":"3c87bd13.713992","type":"debug","z":"3ab2cdb4.c961ba","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":450,"y":120,"wires":[]},{"id":"5c3b1ea5.d3edf8","type":"event","z":"3ab2cdb4.c961ba","name":"","controlTopic":"control","startCmd":"start","stopCmd":"stop","meanInterval":"1","distribution":"exponential","minInterval":"1","maxInterval":"2","outputTopic":"event","outputPayload":"timestamp","x":310,"y":140,"wires":[["3c87bd13.713992","dc35f49a.c99fd8"]]},{"id":"c71c5964.dce538","type":"debug","z":"3ab2cdb4.c961ba","name":"","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":770,"y":160,"wires":[]},{"id":"dc35f49a.c99fd8","type":"change","z":"3ab2cdb4.c961ba","name":"mean","rules":[{"t":"set","p":"topic","pt":"msg","to":"data/mean","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":450,"y":160,"wires":[["3a9f469.02cbb3a"]]},{"id":"3a9f469.02cbb3a","type":"statistics","z":"3ab2cdb4.c961ba","name":"mean delay","dataSetSize":0,"inputField":"delay","inputFieldType":"msg","resultField":"payload","resultFieldType":"msg","parameterField":"","parameterFieldType":"payload","stripFunction":false,"resultOnly":true,"x":610,"y":160,"wires":[["c71c5964.dce538"]]},{"id":"d9f044d3.0c2c28","type":"inject","z":"3ab2cdb4.c961ba","name":"clear","repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"clear","payload":"","payloadType":"date","x":450,"y":200,"wires":[["3a9f469.02cbb3a"]]},{"id":"d8afe4cd.65a53","type":"inject","z":"3ab2cdb4.c961ba","name":"start","props":[{"p":"topic","vt":"str"},{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"control","payload":"start","payloadType":"str","x":170,"y":100,"wires":[["5c3b1ea5.d3edf8"]]},{"id":"c4ce78c3.2705f8","type":"inject","z":"3ab2cdb4.c961ba","name":"stop","props":[{"p":"topic","vt":"str"},{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"control","payload":"stop","payloadType":"str","x":170,"y":140,"wires":[["5c3b1ea5.d3edf8"]]}]
```
<img src="https://github.com/drmibell/node-red-contrib-random-event-generator/blob/master/screenshots/event-demo.png?raw=true"/>

