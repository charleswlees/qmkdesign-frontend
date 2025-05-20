import React from 'react';
import './LayerBar.css'; // Assuming you'll create a CSS file for styling

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
  LayerRemove
}) => {
  const renderTabs = () => {
    const tabs = [];
    for (let i = 0; i < LayerCount; i++) {
      // Determine if this tab is the current layer
      const isCurrent = i === CurrentLayer;

      // Add a class based on whether it's the current layer for styling
      const tabClassName = isCurrent ? 'layer-tab current' : 'layer-tab';

      tabs.push(
        <div
          key={i} // Use index as key (assuming layers won't be reordered or deleted frequently)
          className={tabClassName}
          onClick={() => LayerChange(i)} // Call LayerChange with the tab's index
        >
          {/* Display the layer number, often 1-based for UI */}
          Layer {i + 1}
        </div>,
      );
    }
    return tabs;
  };

  return (
    <>
      <div className="layerbar">{renderTabs()}</div>
      <div className="addLayer" onClick={LayerAdd}>Add Layer</div>
      <div className="removeLayer" onClick={LayerRemove}>Remove Layer</div>
    </>
  )
};

export default LayerBar;

