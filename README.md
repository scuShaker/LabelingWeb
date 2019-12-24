# Object Detection Image Labeler

Object detection image labeling tool, based on[web-labeler-react](https://github.com/scuShaker/image-labeler-react)

# Usage

```bash
# client side dev server
yarn
yarn --cwd ./server
yarn start 

# on another bash
yarn server
```

Put your unlabeled image file under `/server/public/images` and start labeling.

The annotation will be saved in `/server/labeledData`, you can change the output path in the `/server/config.js` file.
