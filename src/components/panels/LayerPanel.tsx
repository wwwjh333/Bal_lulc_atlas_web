"use client";

import styles from "./panel.module.css";

export type LayerPanelProps = {
  naipVisible: boolean;
  predictionVisible: boolean;
  predictionOpacity: number;
  onNaipVisibleChange: (visible: boolean) => void;
  onPredictionVisibleChange: (visible: boolean) => void;
  onPredictionOpacityChange: (opacity: number) => void;
};

export default function LayerPanel(props: LayerPanelProps) {
  return (
    <div className={styles.stack}>
      <label className={styles.toggle}>
        <span className={styles.toggleLeft}>
          <input
            className={styles.check}
            type="checkbox"
            checked={props.naipVisible}
            onChange={(e) => props.onNaipVisibleChange(e.target.checked)}
          />
          <span style={{ minWidth: 0 }}>
            <div className={styles.toggleTitle}>NAIP</div>
            <div className={styles.toggleHint}>True color imagery</div>
          </span>
        </span>
      </label>

      <label className={styles.toggle}>
        <span className={styles.toggleLeft}>
          <input
            className={styles.check}
            type="checkbox"
            checked={props.predictionVisible}
            onChange={(e) => props.onPredictionVisibleChange(e.target.checked)}
          />
          <span style={{ minWidth: 0 }}>
            <div className={styles.toggleTitle}>Prediction</div>
            <div className={styles.toggleHint}>Model output overlay</div>
          </span>
        </span>
      </label>

      <div className={styles.sliderBlock}>
        <div className={styles.sliderHeader}>
          <div className={styles.sliderLabel}>Prediction opacity</div>
          <div className={styles.sliderValue}>{props.predictionOpacity.toFixed(2)}</div>
        </div>
        <input
          className={styles.slider}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={props.predictionOpacity}
          onChange={(e) => props.onPredictionOpacityChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

