//Google Speech
const speech = require('@google-cloud/speech');
const fs = require('fs')
const client = new speech.SpeechClient();
async function quickstart(){
  // The path to the remote LINEAR16 file

  const filename = './test-speech.wav';
  const file = fs.readFileSync(filename);
  const audioBytes = file.toString('base64');


  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
}

quickstart();