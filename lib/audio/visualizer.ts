export interface AudioLevelAnalysis {
  isSilent: boolean;
  averageRms: number;
  maxRms: number;
}

export async function analyzeAudioEnergy(audioBlob: Blob): Promise<AudioLevelAnalysis> {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      return { isSilent: false, averageRms: 0.1, maxRms: 0.2 };
    }

    const audioCtx = new AudioContextClass();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0);
    const length = channelData.length;
    let sumSquares = 0;
    let maxAmp = 0;

    const step = Math.max(1, Math.floor(length / 20000));
    let sampleCount = 0;

    for (let i = 0; i < length; i += step) {
      const val = channelData[i];
      const absVal = Math.abs(val);
      if (absVal > maxAmp) maxAmp = absVal;
      sumSquares += val * val;
      sampleCount++;
    }

    const rms = Math.sqrt(sumSquares / (sampleCount || 1));
    await audioCtx.close();

    const isSilent = rms < 0.002 && maxAmp < 0.01;
    return {
      isSilent,
      averageRms: rms,
      maxRms: maxAmp,
    };
  } catch {
    return { isSilent: false, averageRms: 0.05, maxRms: 0.1 };
  }
}

export function drawAudioVisualizer(
  canvas: HTMLCanvasElement,
  dataArray: Uint8Array<ArrayBuffer>,
  options: {
    barColor?: string;
    glowColor?: string;
    barWidth?: number;
    barGap?: number;
  } = {}
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const barColor = options.barColor || "#6366f1";
  const glowColor = options.glowColor || "rgba(99, 102, 241, 0.4)";
  const barWidth = options.barWidth || 3;
  const barGap = options.barGap || 2;

  ctx.clearRect(0, 0, width, height);

  const numBars = Math.floor(width / (barWidth + barGap));
  const step = Math.floor(dataArray.length / numBars);

  for (let i = 0; i < numBars; i++) {
    const dataIndex = Math.min(i * step, dataArray.length - 1);
    const value = dataArray[dataIndex] / 255.0;
    const barHeight = Math.max(4, value * height * 0.85);

    const x = i * (barWidth + barGap);
    const y = (height - barHeight) / 2;

    ctx.shadowBlur = 4;
    ctx.shadowColor = glowColor;

    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    gradient.addColorStop(0, barColor);
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.5)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, 2);
    ctx.fill();
  }
}
