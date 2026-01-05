import { useRef } from 'react';

interface FileSelectorProps {
	onFileSelect: (file: File) => void;
}

export function FileSelector({ onFileSelect }: FileSelectorProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && file.name.endsWith('.md')) {
			onFileSelect(file);
		}
	};

	return (
		<div className="file-selector">
			<input
				ref={fileInputRef}
				type="file"
				accept=".md"
				onChange={handleChange}
				style={{ display: 'none' }}
			/>
			<button onClick={handleClick} className="open-btn">
				打开文件
			</button>
		</div>
	);
}
