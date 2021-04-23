
const zlib = require('zlib');

exports.handler = function(event, context) {
    processAwsLogsData(event, context);
};

function processAwsLogsData(event, context) {

    // decode input from base64
    var zippedInput = new Buffer.from(event.awslogs.data, 'base64');

    // decompress the input
    zlib.gunzip(zippedInput, function(error, buffer) {
        if (error) { context.fail(error); return; }

        // parse the input from JSON
        var awslogsData = JSON.parse(buffer.toString('utf8'));

        // Sometimes CloudWatch Logs may emit Kinesis records with a "CONTROL_MESSAGE" type,
        // mainly for checking if the destination is reachable. If it is we are done here.
        if (awslogsData.messageType === 'CONTROL_MESSAGE') {
            return;
        }
    
        // We have a "DATA_MESSAGE", process it
        console.log(`Processing log data, LOG_GROUP=${awslogsData.logGroup}, LOG_STREAM=${awslogsData.logStream}, OWNER=${awslogsData.owner}`);
        awslogsData.logEvents.forEach(function(logEvent) {

            // Pull the available info from the log event (id, timestamp, message)
            let id = logEvent.id;
            let timestamp = new Date(1 * logEvent.timestamp);
            let message = logEvent.message;
            console.log(`logEvent: id=${id}, timestamp=${timestamp}, message=${message}`);
        });
    });
}
