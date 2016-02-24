module.exports = {

  friendlyName: 'Upload to S3',
  description: 'Upload an object to S3.',
  extendedDescription: 'This allows you to upload a file to S3. If you require additional functionality, please open an Issue on the Github page.',
  sync: true,

  inputs: {
    bucket: {
      example: 'my_s3_bucket',
      description: 'Name of the AWS S3 Bucket you wish to upload this file to..',
      required: true
    },
    path: {
      example: 'myfile.jpg',
      description: 'Bucket key to upload to (E.G /images/myfile.jpg)',
      required: true
    },
    acl: {
      example: 'public-read',
      description: 'Access Control List: Who should be able to read/write your uploaded file? - You can find a list of options on docs.aws.amazon.com.',
      required: true
    },
    //region: {
      //example: 'us-east-1',
      //description: 'The region in which the S3 bucket is located.',
      //required: true
    //},
    upload: {
      example: '/path/to/file',
      description: 'The path to the file you wish to upload.',
      required: true
    },
    secret_key: {
      example: 'abc1234cged',
      description: 'Your AWS secret access key',
      required: true
    },
    access_key: {
      example: 'abc1234cge2424ded',
      description: 'Your AWS access key ID.',
      required: true
    }


  },

  defaultExit: 'success',

  exits: {
    error: {
      description: 'An unexpected error occurred. You may find more help on https://github.com/NileFrater/machinepack-awss3tools.',
      errorcode: 'The following error occured:'
    },
    success: {
      example:  {
        fileURL: 'https://my-bucket.s3.amazonaws.com/path/123456789-ab340-43rkf.txt'
      }
    }
  },

  fn: function (inputs, exits) {

    // Require NPM package S3
    var s3 = require('s3');

    // Create an upload client, with all the specified settings. 
    var client = s3.createClient({
          maxAsyncS3: 20,     
          s3RetryCount: 3,    
          s3RetryDelay: 1000,  
          multipartUploadThreshold: 20971520, 
          multipartUploadSize: 15728640, 
          s3Options: {
              accessKeyId: inputs.access_key,
              secretAccessKey: inputs.secret_key,

          },
        });

  var params = {
      localFile: inputs.upload,


      s3Params: {
        Bucket: inputs.bucket,
        Key: inputs.path,
        ACL: inputs.acl,

      },
      };


    var uploader = client.uploadFile(params);

      uploader.on('error', function(err) {
       return exits.error({
        description: '',
        errorcode: err.stack
       })
      });
      uploader.on('progress', function() {
            console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
    });

      uploader.on('end', function() {
        return exits.success({
          fileURL: "https://s3.amazonaws.com/" + inputs.bucket + "/" + inputs.path
        })
      });

  }

};