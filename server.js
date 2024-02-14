import express from "express";
import ytdl from "ytdl-core";
const app = express();

app.disable("x-powered-by");

// Serve a HTML page with a form
app.get("/", (_, response) => {
  response.send(`
    <form action="/download" method="get">
      <label for="url">YouTube Video URL:</label><br>
      <input type="text" id="url" name="url" value=""><br>
      <input type="submit" value="Download">
    </form>
  `);
});

app.get("/download", async (request, response) => {
  const url = request.query.url;

  if (!ytdl.validateURL(url)) {
    return response.status(400).send("Invalid YouTube URL");
  }

  try {
    await download();
  } catch (err) {
    console.error(err);
    response.status(500).send("An error occurred");
  }

  async function download() {
    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
      format: "mp3",
    });

    // Get the video title and replace invalid characters
    const title = info.videoDetails.title.replace(/[<>:"\/\\|?*]+/g, "-");

    response.header(
      "Content-Disposition",
      `attachment; filename="${title}.mp3"`
    );

    ytdl
      .downloadFromInfo(info, { format: audioFormat })
      .pipe(response)
      .on("finish", () => {
        console.log("Download finished");
      });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
