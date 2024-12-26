import React, { useState, useEffect } from 'react';
// import './SocialShare.css'; // Make sure to import the CSS file

const SocialShare = () => {
  const [baseUrl, setBaseUrl] = useState('http://localhost:5001/');
  const [platform, setPlatform] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // Automatically generate the link when the platform is selected
  useEffect(() => {
    if (platform) {
      setGeneratedLink(`${baseUrl}?platform=${platform}`);
    }
  }, [platform, baseUrl]);

  // Function to copy the link to the clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
      .then(() => alert('Link copied to clipboard!'))
      .catch((error) => alert('Failed to copy the link: ' + error));
  };

  return (
    <div className="social-share-container">
      <h1 className="heading">Generate Shareable Link</h1>

      <input
        className="input-field"
        type="text"
        placeholder="Base URL"
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
      />

      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        className="platform-dropdown"
      >
        <option value="">Select Platform</option>
        <option value="facebook">Facebook</option>
        <option value="instagram">Instagram</option>
        <option value="youtube">YouTube</option>
      </select>

      {generatedLink && (
        <div className="generated-link-section">
          <p className="generated-link">{generatedLink}</p>
          <button className="copy-button" onClick={copyToClipboard}>Copy Link</button>
        </div>
      )}
    </div>
  );
};

export default SocialShare;
