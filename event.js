/**
 * Copyright 2017-2020 M. I. Bell
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
        RED.nodes.createNode(this,config);
        // Copy configuration items
        this.controlTopic = config.controlTopic.toLowerCase();
        this.startCmd = config.startCmd.toLowerCase();
        this.stopCmd = config.stopCmd.toLowerCase();
        this.distribution = config.distribution;
        this.meanInterval = Math.abs(parseFloat(config.meanInterval)); //seconds
        this.minInterval = Math.abs(parseFloat(config.minInterval));
        this.maxInterval =  Math.abs(parseFloat(config.maxInterval));
        this.outputPayload = config.outputPayload || 'timestamp';
        this.outputTopic = config.outputTopic || 'event';
        // Save "this" object
        var node = this;
        var distribution = node.distribution;
        var mean = node.meanInterval || 1;
        var min = node.minInterval || 1;
        var max = node.maxInterval || 2;
        var context = node.context();
        var msgToSend = null;
        var run = context.get('run') || false;
        
        node.on('input', function(msg) {
            if (typeof msg.topic === 'undefined' || typeof msg.payload === 'undefined') {
                return null;
            }
            if (msg.topic.toLowerCase() !== node.controlTopic) {
                return null;
            }
            // Change state
            switch (msg.payload.toLowerCase()) {
                case node.startCmd:
                    run = true;
                    break;
                case node.stopCmd:
                    run = false;
                    break;
                default:
                    run = ! run;
            }
            context.set('run',run);
            if (run) {
                node.status({fill:'green',shape:'dot'});
            } else {
                node.status({fill:'red',shape:'ring',text:'stopped'});
            }
            context.set('output',msg);
            loop();
        })
        
        node.on('close',function(){
            clearTimeout(startTimer)
        })
        
        function loop() {
            var delay = 0
            msgToSend = context.get('output');
            if (typeof msgToSend.topic !== 'undefined' && msgToSend.topic.toLowerCase() === node.controlTopic) {
                msgToSend = null;
            }
                node.send(msgToSend);
            if (context.get('run')) {
                var msgToSend = context.get('output');
                switch (distribution) {
                    case 'exponential':
                        delay = expInterval(mean);
                        break;
                    case 'uniform':
                        delay = uniformInterval(min,max);
                        break;
                    default:
                        node.error('No distribution specified');
                        return
                }
                msgToSend.payload = node.outputPayload;
                
                if (msgToSend.payload === 'timestamp') {
                    msgToSend.payload = Date.parse (new Date());

                }
                msgToSend.topic = node.outputTopic;
                msgToSend.delay = delay;
                context.set('output',msgToSend);
                var startTimer = setTimeout(loop,1000 * delay);
                node.status({fill:'green',text:delay.toFixed(2)});
            }
        }
        
        function expInterval(m) { // see Knuth, Vol. 2, p. 133
            var u = Math.random();
            if (u === 0){
                u = 5e-234;
            }
            return - m * Math.log(u);
        }

        function uniformInterval(min,max) {
            return Math.random() * (max - min) + min;
        }
    }
    RED.nodes.registerType("event",RandomEventNode);
}
