function normalize(str) {
  return str?.toLowerCase().replace(/\s+/g, " ").trim();
}

function convertGoogleDriveLink(link) {
  const match = link.match(/\/d\/([^/]+)\//);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : link;
}

function formatImageLink(url) {
  if (!url) return "";
  const safeURL = convertGoogleDriveLink(url);
  return `<a class="image-popup-link" href="${safeURL}">View</a>`;
}

function formatDate(value) {
  const date = new Date(value);
  return isNaN(date)
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
}