let originalWidth = 0;
let originalHeight = 0;
let originalImage = null;
let originalFileName = "";

const imageInput = document.getElementById("imageInput");

const originalInfo = document.getElementById("originalInfo");
const originalDimensions = document.getElementById("originalDimensions");
const originalSize = document.getElementById("originalSize");
const originalFormat = document.getElementById("originalFormat");

const widthInput = document.getElementById("widthInput");
const resizeInfo = document.getElementById("resizeInfo");
const resizeDimensions = document.getElementById("resizeDimensions");

const formatSelect = document.getElementById("formatSelect");
const estimatedSize = document.getElementById("estimatedSize");


imageInput.addEventListener("change", function () {

  const file = imageInput.files[0];

  if (!file) {
    return;
  }

  const isHEIC =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name);



  let image = new Image();

  image.onload = function () {

    originalDimensions.textContent =
      image.naturalWidth + " × " + image.naturalHeight + " px";

    originalWidth = image.naturalWidth;
    originalHeight = image.naturalHeight;
    originalImage = image;
    originalFileName = file.name;

    originalSize.textContent =
      formatFileSize(file.size);

    originalFormat.textContent =
      file.type || "不明";

    originalInfo.hidden = false;
    resizeInfo.hidden = false;

    URL.revokeObjectURL(image.src);
  };

  if (isHEIC) {
    console.log("HEIC判定:", isHEIC);
    
    heic2any({
      blob: file,
      toType: "image/jpeg"
    }).then(function (convertedBlob) {

      image.src = URL.createObjectURL(convertedBlob);

    }).catch(function () {
      alert("HEIC画像の変換に失敗しました");
    });

  } else {
    image.src = URL.createObjectURL(file);
  }

});


function formatFileSize(bytes) {

  if (bytes < 1024) {
    return bytes + " B";
  }

  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  }

  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}


function updateEstimate() {

  const width = parseInt(widthInput.value, 10);

  if (!width || !originalWidth || !originalHeight || !originalImage) {
    resizeDimensions.textContent = "";
    estimatedSize.textContent = "";
    return;
  }

  const height = Math.round(
    width * originalHeight / originalWidth
  );

  resizeDimensions.textContent =
    width + " × " + height + " px";

  resizeInfo.hidden = false;


  // Canvasを作成
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  // 画像をリサイズ
  ctx.drawImage(originalImage, 0, 0, width, height);


  // 選択した形式でBlobを作成
  canvas.toBlob(function (blob) {

    if (!blob) {
      estimatedSize.textContent = "";
      return;
    }

    estimatedSize.textContent =
      "推定：約 " + formatFileSize(blob.size);

  }, formatSelect.value, 0.9);
}


widthInput.addEventListener("input", updateEstimate);

formatSelect.addEventListener("change", updateEstimate);

const resizeButton = document.getElementById("resizeButton");


resizeButton.addEventListener("click", function () {

  const width = parseInt(widthInput.value, 10);

  if (!width || !originalWidth || !originalHeight || !originalImage) {
    return;
  }

  const height = Math.round(
    width * originalHeight / originalWidth
  );


  // Canvasを作成
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  // 画像をリサイズ
  ctx.drawImage(originalImage, 0, 0, width, height);


  // 選択した形式で画像を作成
  canvas.toBlob(function (blob) {

    if (!blob) {
      return;
    }

    // 保存用URLを作成
    const url = URL.createObjectURL(blob);

    // 拡張子を決める
    let extension = "jpg";

    if (formatSelect.value === "image/png") {
      extension = "png";
    } else if (formatSelect.value === "image/webp") {
      extension = "webp";
    }

    // 元ファイル名から拡張子を削除
    const baseName = originalFileName.replace(/\.[^/.]+$/, "");

    // ダウンロード
    const link = document.createElement("a");
    link.href = url;
    link.download = baseName + "_" + width + "." + extension;

    link.click();

    URL.revokeObjectURL(url);

  }, formatSelect.value, 0.9);

});