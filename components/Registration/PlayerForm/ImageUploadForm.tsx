import { Box } from "@mui/material";

const ImageUploadForm = ({setSelectedFile, setSelectedFileName, setFileInputState, selectedFileName, fileInputState}) => {

    const handleFileInputChange = (event) => {
      const file = event.target.files[0];
      if (file == undefined) {
        setFileInputState("");
        setSelectedFile(null);
        setSelectedFileName("");
      } else {
        setSelectedFile(file);
        setSelectedFileName(file.name);
        setFileInputState(event.target.value);
      }
    };

    return (
    <Box sx={{mb: 2}}>
      <form>
        <label htmlFor="image">Valitse kuva itsestäsi</label>
        <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            onChange={handleFileInputChange}
            value={fileInputState} />
      </form>
      {selectedFileName ? (
        <p><i>Valittu tiedosto: {selectedFileName}</i></p>
      ) : null}
    </Box>
    )

}

export default ImageUploadForm