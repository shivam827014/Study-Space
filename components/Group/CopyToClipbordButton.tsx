// components/CopyToClipboardButton.tsx
import { useState } from 'react';
import copy from 'clipboard-copy';

// Define the props type
interface CopyToClipboardButtonProps {
  text: string; // Text to copy to clipboard
}

const CopyToClipboardButton = ({ text }: CopyToClipboardButtonProps) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopyClick = async () => {
    try {
      await copy(text); // Copy text to clipboard
      setIsCopied(true); // Set the copied state to true

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text to clipboard', error); // Handle any errors
    }
  };

  return (
    <div>
      <button onClick={handleCopyClick}>
        {isCopied ? 'Copied!' : 'Copy to Clipboard'}
      </button>
    </div>
  );
};

export default CopyToClipboardButton;
