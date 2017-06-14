This is a simple file (primarily, image) sharing service. Accepts drag&drop and
paste from clipboard.

Installation:
- have `node.js` installed on your machine;
- clone this repo;
- switch to the folder with the code and run `npm install`; 
it will install all the dependencies.
- then just run the `server/default.js` with node. You may also use slightly more 
advanced tools, like `forever` or `reload`, just `node install -g` them.

Implementation details:
- the files are stored in the `server/uploaded-files` folder "as is"; no metadata 
is generated, no authentication, encryption or protection is implemented;
- The resulting file name is generated by OS temp.file name generation algorithm;
- There's no limitation on the file types, identifying the type of contents is 
up to browser;
- HipChat can only expand fully qualified links so include the domain name when
sharing;
- in-browser history is implemented with LocalStorage, so it's specific for each
instance of browser;
- Right now the only way to clean history is to clean LocalStorage in browser;
- Right now the only way to delete the shared files is to physically remove them
from `server/uploaded-files`.

Pull requests are welcome!