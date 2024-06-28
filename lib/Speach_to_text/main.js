document.addEventListener("DOMContentLoaded", () => {
     let messageDiv = document.getElementById("message");
     let form = document.querySelector("form");
     let languageSelect = document.getElementById("language-select");
     let downloadBtn = document.getElementById("download-btn");
     let resetBtn = document.getElementById("reset-btn");
     let stopBtn = document.getElementById("stop-btn");

     if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
         messageDiv.textContent = "Your browser does not support the Speech Recognition API. Please use Google Chrome or another supported browser.";
         form.style.display = "none";
         return;
     }

     let sr = window.webkitSpeechRecognition || window.SpeechRecognition;
     let spRec = new sr();
     spRec.continuous = true;
     spRec.interimResults = true;

     form.addEventListener("submit", e => {
         e.preventDefault();
         languageSelect.style.display = 'none'; // Hide the language select
         spRec.lang = languageSelect.value; // Set the language based on the dropdown selection
         spRec.start();
     });

     spRec.onresult = res => {
         let text = Array.from(res.results)
             .map(r => r[0])
             .map(txt => txt.transcript)
             .join("");
         form[1].value = text; // Change the index to 1 as the textarea is the second child now
         downloadBtn.style.display = form[1].value ? 'block' : 'none'; // Show or hide the download button based on textarea content
     };

     stopBtn.addEventListener("click", () => {
         spRec.stop();
     });

     resetBtn.addEventListener("click", () => {
         spRec.stop();
         form.reset();
         languageSelect.style.display = 'block'; // Show the language select again
         downloadBtn.style.display = 'none'; // Hide the download button
         form[1].value = ''; // Clear the textarea
     });

     downloadBtn.addEventListener("click", () => {
         let text = form[1].value;
         let blob = new Blob(['\ufeff' + text], { type: 'application/msword' });
         let url = URL.createObjectURL(blob);
         let a = document.createElement('a');
         a.href = url;
         a.download = 'speech-to-text.doc';
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
     });

     form[1].addEventListener("input", () => {
         downloadBtn.style.display = form[1].value ? 'block' : 'none'; // Show or hide the download button based on textarea content
     });

 });