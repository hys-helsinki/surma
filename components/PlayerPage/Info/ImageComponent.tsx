import { CldImage } from "next-cloudinary";

const ImageComponent = ({
  imageUrl,
  showPicture
}: {
  imageUrl: string;
  showPicture: boolean;
}) => {
  return (
    <div>
      {showPicture ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <CldImage
            width="500"
            height="500"
            src={imageUrl}
            sizes="(max-width: 768px) 100vw, 33vw"
            alt="Profile picture"
            style={{
              objectFit: "contain"
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ImageComponent;
