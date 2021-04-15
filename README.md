# node-red-contrib-random-event-generator
A Node-RED node for generating events at random intervals.
## Install
Either use the Manage Palette option in the Node-RED Editor menu or run the following command in the Node-RED user directory (typically `~/.node-red`):

    npm install node-red-contrib-random-event-generator
## Usage
This node generates events (messages) at intervals drawn from a random distribution. By default, an exponential distribution is used, where the probability of a given interval between events is an exponentially decreasing function of the length of the interval. This is the behaviour displayed by radioactive decays, noise in electronic devices, and other physical phenomena. Alternatively, the distribution can be chosen to be uniform in a selected range or gaussian (normal) with a selected mean and standard deviation.

The user can specify the average interval for the exponential distribution, the minimum and maximum intervals for the uniform distribution, or the mean interval and standard deviation for the gaussian distribution. Negative values for these inputs are rejected. For the uniform distribution, the maximum interval must be greater than the minimum; otherwise, a warning is issued. In the gaussian case, the distribution is truncated at zero. This is not a significant effect if the mean is significantly greater than the standard deviation (preferably three times or more).

Messages with the topic <code>Control Topic</code> are control messages, which can start or stop the generator, depending on the `msg.payload`. Payloads representing `start` and `stop` are (case-insensitive) strings defined by the user when the node is deployed. If a control message is received with a payload that is a number or boolean, the payload is converted to a string and then tested against the command definitions. Any command not recognized as `start` or `stop` will toggle the state of the generator. The generator can also be programmed to stop after a specified number of messages have been sent.

The output messages have a user-defined topic (default: `event`) and payload (default: `timestamp`) and two additional properties, `msg.delay`, which is the time since the previous event, and `msg.count`, which is the position (starting at zero) of the event in the sequence sent since the generator was last started. If the payload selected is `timestamp`, it is updated for each new event. Each new message is cloned from the previous one, so the user is free to modify any message without affecting previous or subsequent ones.

The node has been useful in testing the operation of message queues and in Monte-Carlo simulation of physical systems.

## Node status
The state of the node is indicated by a status object, a red ring when the generator is stopped and a green dot with the value of the current interval when it is running. If the node receives a `stop` or `toggle` command while running, the pending event will not be sent, but the status will display (and send to an attached `status ` node) the interval value corresponding to that event.

## Numerical methods
All three distributions, exponential, uniform, and gaussian, are calculated from the JavaScript method `Math.random()`. This function returns floating-point, pseudo-random numbers *u* that are approximately uniform in the interval [0,1). The specifics are implementation dependent, and the initial seed is chosen by the algorithm and cannot be changed or reset by the user. Hence, the results are not reliable for cryptographic or other security purposes but are adequate for routine testing or simulation. 


Samples from the uniform distribution in the interval [*min*,*max*) are obtained from the obvious relation

<p><div align="center">
<i>u</i> = Math.random() * (<i>max</i> - <i>min</i>) + <i>min</i>
</div></p>

The exponential and gaussian distributions are calculated from the uniform distribution using the methods described in D.E. Knuth, <i>The Art of Computer Programming</i>, Vol. 2, Sec. 3.4. Samples from an exponential distribution with mean <i>m</i> are given by

<p><div align = "center">
<i>u</i> = - <i>m</i> * Math.log(Math.random())
</div></p>

Samples from a gaussian distribution are obtained by the Box–Muller method.

## Examples
This flow demonstrates the basic operation of the `event` node. The average interval between events and its standard deviation are calculated using the contributed [statistics](https://flows.nodered.org/node/node-red-contrib-statistics) node. This part of the flow can be omitted, but the user may be interested in seeing how quickly the average converges to its expected value. Correct operation of the node can be confirmed by observing that the standard deviation approaches the mid-value of the uniform interval, the specified value for the gaussian distribution, or the the square-root of the mean in the exponential case.

<img src="https://github.com/drmibell/node-red-contrib-random-event-generator/blob/master/screenshots/event-demo.png?raw=true"/>

The source for this flow is available as `event-demo.json` in the Examples section of the  Import sub-menu or from [GitHub](https://github.com/drmibell/node-red-contrib-random-event-generator/blob/master/examples/event-demo.json).