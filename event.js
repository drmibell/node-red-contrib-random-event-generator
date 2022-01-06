/**
 * Copyright 2017-2021 M. I. Bell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
"use strict";
module.exports = function(RED) {
    function RandomEventNode(config) {
        RED.nodes.createNode(this,config)
        this.controlTopic = config.controlTopic.toLowerCase()
        this.startCmd = config.startCmd.toLowerCase()
        this.stopCmd = config.stopCmd.toLowerCase()
        this.distribution = config.distribution
        this.expMeanInterval =  Math.abs(parseFloat(config.expMeanInterval)) //seconds
        this.minInterval =  Math.abs(parseFloat(config.minInterval))
        this.maxInterval =   Math.abs(parseFloat(config.maxInterval))
        this.gaussMeanInterval =  Math.abs(parseFloat(config.gaussMeanInterval))
        this.stdDev =  Math.abs(parseFloat(config.stdDev))
        this.maxEventCount = config.maxEventCount
        this.outputPayload = config.outputPayload
        this.outputPayloadType = config.outputPayloadType
        this.outputTopic = config.outputTopic || 'event'
        let node = this
        let controlTopic = node.controlTopic
        let distribution = node.distribution
        let expMean = node.expMeanInterval || 1
        let min = node.minInterval || 1
        let max = node.maxInterval || 2
        let gaussMean = node.gaussMeanInterval || 1
        let stdDev = node.stdDev || 1
        let context = node.context()
        let outputTopic = node.outputTopic
        let outputPayload = node.outputPayload
        let outputPayloadType = node.outputPayloadType
        let payload = RED.util.evaluateNodeProperty(outputPayload, outputPayloadType, node)
        let msgToSend = {"count":-1}
        let maxEventCount = node.maxEventCount
        if (maxEventCount <= 0) {maxEventCount = Infinity}
        let state = 'stopped'
        context.set('state',state)
        let stoppedStatus = {fill:'red',shape:'ring',text:'stopped'}
        node.status(stoppedStatus)
        let timer, delay

        node.on('input', function(msg) {
            if (typeof msg.topic !== 'string') {return}
            if (msg.topic.toLowerCase() !== controlTopic) {return}
            state = context.get('state')
            switch (msg.payload.toString().toLowerCase()) {
                case node.startCmd:
                    if (state === 'running') {  // already running
                        node.warn('command ignored: already running')
                        return                    
                    } else {
                        state = 'started'
                    }
                    break
                case node.stopCmd:
                    if (state === 'stopped') {  // already stopped
                        node.warn('command ignored: already stopped')
                        return
                    }
                    state = 'stopped'
                    break
                default:    // toggle
                    if (state === 'stopped') {
                        state = 'started'
                    } else {
                        state = 'stopped'
                    }
             }
            context.set('state',state)
            if (distribution === 'uniform' && min >= max) {
                node.warn('must have max > min for uniform distribution')
                return
            }
            if (state === 'started') {
                node.status({fill:'green',shape:'dot',text: 'started'})
                loop()
            } else {
                node.status(stoppedStatus)
            }
        })
        
        node.on('close',function(){
            clearTimeout(timer)
        })
        
        function loop() {
            state = context.get('state')
            if (state === 'running'){
                node.send(RED.util.cloneMessage(msgToSend))
            } else if  (state === 'started') {
                msgToSend.count = -1
                state = 'running'
                context.set('state',state)
            } else if (state === 'stopped') {
                return
            }
            if (state === 'running') { 
                switch (distribution) {
                    case 'exponential':
                        delay = expInterval(expMean)
                        break
                    case 'uniform':
                        delay = uniformInterval(min,max)
                        break
                    case 'gaussian':
                        delay = gaussianInterval(gaussMean,stdDev)
                        break
                    default:
                        node.error('No distribution specified')
                        return
                }
                msgToSend.payload = payload
                if (outputPayloadType === 'date') {
                    msgToSend.payload = (new Date()).getTime()
                }
                msgToSend.topic = outputTopic
                msgToSend.delay = delay
                msgToSend.count ++
                if (msgToSend.count >= maxEventCount) {
                    state = 'stopped'
                    context.set('state',state)
                    node.status(stoppedStatus)
                    return
                }
                timer = setTimeout(loop,1000 * delay)
                node.status({fill:'green',shape:'dot',text:delay.toFixed(2)})
            }
        }
        
        function expInterval(m) {   // see Knuth, Vol. 2, p. 133
            let u = Math.random()
            if (u === 0) {u = Number.MIN_VALUE}
            return - m * Math.log(u)
        }

        function uniformInterval(min,max) {
            return Math.random() * (max - min) + min
        }
        
        function gaussianInterval(mu,sigma) {   // Box–Muller method, see Knuth, Vol. 2, p. 122
            let two_pi = 2 * Math.PI
            let r, z0, z1, u1, u2
            do {
                u1 = Math.random()
                u2 = Math.random()
                r = sigma * Math.sqrt(-2.0 * Math.log(u1))
                z0  = r * Math.cos(two_pi * u2) + mu
                z1  = r * Math.sin(two_pi * u2) + mu
            }
            while (z0 <= 0)
            return z0
        }
    }
    RED.nodes.registerType("event",RandomEventNode);
}
