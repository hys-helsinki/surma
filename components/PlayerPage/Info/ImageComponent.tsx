import Image from "next/image";
import { useState } from "react";

const ImageComponent = ({
  imageUrl,
  setUpdateImage
}: {
  imageUrl: string;
  setUpdateImage: any;
}) => {
  const [showPicture, setShowPicture] = useState(false);

  return (
    <div>
      {showPicture ? (
        <div>
          <Image
            src={imageUrl}
            width="100%"
            height="100%"
            layout="responsive"
            objectFit="contain"
            alt="profile picture"
          ></Image>
        </div>
      ) : null}
      <button
        onClick={() => setShowPicture(!showPicture)}
        style={{ marginRight: "10px" }}
      >
        {showPicture ? "Piilota" : "Näytä kuva"}
      </button>
      <button onClick={() => setUpdateImage((prevState) => !prevState)}>
        Vaihda kuva
      </button>
    </div>
  );
};

export default ImageComponent;
