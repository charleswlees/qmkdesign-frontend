import React from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import "../styles/LayerBar.css"; 

interface LayerBarProps {
  LayerCount: number;
  CurrentLayer: number;
  LayerChange: (index: number) => void;
  LayerAdd: () => void;
  LayerRemove: () => void;
}

const LayerBar: React.FC<LayerBarProps> = ({
  LayerCount,
  CurrentLayer,
  LayerChange,
  LayerAdd,
  LayerRemove,
}) => {
  const renderTabs = () => {
    const tabs = [];
    for (let i = 0; i < LayerCount; i++) {

      const isCurrent = i === CurrentLayer;
      const tabClassName = isCurrent ? "layer-tab current" : "layer-tab";

      tabs.push(
        <div
          key={i} 
          className={tabClassName}
          onClick={() => LayerChange(i)} 
        >
          Layer {i + 1}
        </div>,
      );
    }
    return tabs;
  };

  return (
    <div className="layerbar">
      {renderTabs()}
      <div className="layer-controls">
        <button
          onClick={LayerAdd}
          className="layer-action-button"
          title="Add Layer"
          disabled={LayerCount >= 10}
        >
          <FaPlus />
        </button>
        <button
          onClick={LayerRemove}
          className="layer-action-button"
          title="Remove Last Layer"
          disabled={LayerCount <= 1}
        >
          <FaMinus />
        </button>
      </div>
    </div>
  );
};

export default LayerBar;
