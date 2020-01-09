module.exports = function(Container) {

	Container.afterRemote('upload', function(ctx, data, next) {
	    var now = new Date();
	    const newName = now.getTime();
	    const {container, name} = data.result.files.file[0];

	    // file wants to be renamed
	    if (newName) {

	      // create new name with old ext
	      let ext = name.split('.').slice(-1).pop();
	      let newFullName = `${newName}.${ext}`;

	      data.result.files.file[0].name = newFullName;

	      // pipe old file as new one with new name
	      let dlStream = Container.downloadStream(container, name);
	      let ulStream = Container.uploadStream(container, newFullName);
	      dlStream.pipe(ulStream);
	      ulStream.on('finish', () => {
	        Container.removeFile(container, name, (err) => {
	          next();
	        });
	      });
	    } else next();
	  });

};
