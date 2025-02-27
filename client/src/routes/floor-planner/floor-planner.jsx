import { Button, Container, TextInput } from "@mantine/core";
import {
  IconDoor,
  IconTextSize,
  IconTrashXFilled,
  IconWall,
  IconWindow,
} from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Group,
  Layer,
  Line,
  Path,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";

const FloorPlanner = () => {
  const [objects, setObjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [textValue, setTextValue] = useState("");
  const transformerRef = useRef(null);
  const stageRef = useRef(null);

  // Define the template
  const initialTemplate = [
    {
      id: "wall-1",
      type: "wall",
      x: 500,
      y: 200,
      width: 50,
      height: 10,
    },
    {
      id: "wall-1.1",
      type: "wall",
      x: 635,
      y: 200,
      width: 470,
      height: 10,
    },
    {
      id: "wall-2",
      type: "wall",
      x: 500,
      y: 604,
      width: 200,
      height: 6,
    },
    {
      id: "wall-3",
      type: "wall",
      x: 500,
      y: 200,
      width: 10,
      height: 200,
    },
    {
      id: "wall-4",
      type: "wall",
      x: 500,
      y: 200,
      width: 10,
      height: 200,
    },
    {
      id: "wall-5",
      type: "wall",
      x: 700,
      y: 400,
      width: 10,
      height: 200,
    },
    {
      id: "wall-6",
      type: "wall",
      x: 1100,
      y: 200,
      width: 10,
      height: 400,
    },
    {
      id: "wall-7",
      type: "wall",
      x: 700,
      y: 600,
      width: 410,
      height: 10,
    },
    {
      id: "wall-8",
      type: "wall",
      x: 950,
      y: 400,
      width: 40,
      height: 10,
    },
    {
      id: "wall-9",
      type: "wall",
      x: 1075,
      y: 400,
      width: 30,
      height: 10,
    },
    {
      id: "wall-10",
      type: "wall",
      x: 940,
      y: 400,
      width: 10,
      height: 200,
    },
    {
      id: "wall-11",
      type: "wall",
      x: 500,
      y: 400,
      width: 6,
      height: 210,
    },
    {
      id: "wall-12",
      type: "wall",
      x: 500,
      y: 400,
      width: 50,
      height: 10,
    },
    {
      id: "wall-12.1",
      type: "wall",
      x: 635,
      y: 400,
      width: 70,
      height: 10,
    },
    {
      id: "wall-13",
      type: "wall",
      x: 700,
      y: 200,
      width: 15,
      height: 50,
    },
    {
      id: "door-1",
      type: "door",
      x: 550,
      y: 130,
      width: 6,
      height: 80,
    },
    {
      id: "door-2",
      type: "door",
      x: 990,
      y: 330,
      width: 6,
      height: 80,
    },
    {
      id: "door-3",
      type: "door",
      x: 550,
      y: 330,
      width: 6,
      height: 80,
    },
    {
      id: "window-1",
      type: "window",
      x: 780,
      y: 595,
      width: 100,
      height: 20,
    },
    {
      id: "window-2",
      type: "window",
      x: 870,
      y: 195,
      width: 100,
      height: 20,
    },
    {
      id: "text-1",
      type: "text",
      x: 770,
      y: 280,
      width: 150,
      height: 40,
      text: "Wohnzimmer",
    },
    {
      id: "text-2",
      type: "text",
      x: 970,
      y: 270,
      width: 150,
      height: 40,
      text: "Kuche",
    },
    {
      id: "text-3",
      type: "text",
      x: 970,
      y: 500,
      width: 150,
      height: 40,
      text: "Badzimmer",
    },
    {
      id: "text-4",
      type: "text",
      x: 770,
      y: 500,
      width: 150,
      height: 40,
      text: "Schlafzimmer",
    },
    {
      id: "text-5",
      type: "text",
      x: 570,
      y: 500,
      width: 150,
      height: 40,
      text: "Balkon",
    },
    {
      id: "text-6",
      type: "text",
      x: 420,
      y: 400,
      width: 150,
      height: 40,
      text: "L:18m",
    },
    {
      id: "text-7",
      type: "text",
      x: 770,
      y: 170,
      width: 150,
      height: 40,
      text: "B:26m",
    },
    {
      id: "text-8",
      type: "text",
      x: 750,
      y: 70,
      width: 300,
      height: 40,
      text: "DEMO FLOOR PLAN",
    },
  ];

  // Load the template when the component mounts
  useEffect(() => {
    setObjects(initialTemplate);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId, objects]);

  const addObject = (type) => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const stageWidth = stage.width();
    const stageHeight = stage.height();

    const objectWidth = type === "wall" ? 200 : type === "text" ? 100 : 80;
    const objectHeight = type === "wall" ? 6 : type === "text" ? 40 : 80;

    // Calculate center position
    const centerX = stageWidth / 2 - objectWidth / 2;
    const centerY = stageHeight / 2 - objectHeight / 2;

    const newObject = {
      id: `${type}-${objects.length + 1}`,
      x: centerX, // Center X position
      y: centerY, // Center Y position
      width: objectWidth,
      height: objectHeight,
      type,
      text: type === "text" ? "Text" : "", // Default text for text objects
    };

    setObjects((prevObjects) => [...prevObjects, newObject]);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    const selectedNode = stageRef.current.findOne(`#${id}`);
    if (selectedNode && transformerRef.current) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer().batchDraw();
    }
  };

  const handleTransformEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    setObjects((prevObjects) =>
      prevObjects.map((obj) =>
        obj.id === id
          ? {
              ...obj,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, obj.width * scaleX),
              height: Math.max(5, obj.height * scaleY),
            }
          : obj,
      ),
    );
  };

  const handleDelete = () => {
    if (selectedId) {
      setObjects((prevObjects) =>
        prevObjects.filter((obj) => obj.id !== selectedId),
      );
      setSelectedId(null);
    }
  };

  const handleTextDoubleClick = (id, text) => {
    setEditingTextId(id);
    setTextValue(text);
  };

  const handleTextChange = (e) => {
    setTextValue(e.target.value);
  };

  const handleTextBlur = () => {
    setObjects((prevObjects) =>
      prevObjects.map((obj) =>
        obj.id === editingTextId ? { ...obj, text: textValue } : obj,
      ),
    );
    setEditingTextId(null);
  };

  const exportCanvas = () => {
    const stage = stageRef.current;

    // Check if the stage is properly initialized
    if (!stage) {
      console.error("Stage is not initialized.");
      return;
    }

    // Create a temporary canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = stage.width();
    tempCanvas.height = stage.height();
    const tempContext = tempCanvas.getContext("2d");

    // Fill the temporary canvas with a white background
    tempContext.fillStyle = "white";
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the stage onto the temporary canvas
    const stageCanvas = stage.toCanvas(); // Directly get the canvas element
    tempContext.drawImage(stageCanvas, 0, 0);

    // Export the temporary canvas as an image
    const uri = tempCanvas.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.href = uri;
    link.download = "floor-plan.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container
      fluid
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Stage
        ref={stageRef}
        width={window.innerWidth * 0.98}
        height={window.innerHeight}
        style={{ background: "#F1F0F0", borderRadius: "20px" }}
      >
        <Layer>
          {objects.map((obj) => (
            <Group
              key={obj.id}
              id={obj.id}
              x={obj.x} // Set the x position of the Group
              y={obj.y} // Set the y position of the Group
              draggable
              onClick={() => handleSelect(obj.id)}
              onTransformEnd={(e) => handleTransformEnd(e, obj.id)}
            >
              {obj.type === "wall" && (
                <Rect
                  x={0}
                  y={0}
                  width={obj.width}
                  height={obj.height}
                  fill="black"
                />
              )}
              {obj.type === "door" && (
                <Group>
                  {/* Door Rectangle */}
                  <Rect
                    x={0}
                    y={0}
                    width={6} // Door thickness
                    height={obj.height} // Door height
                    fill="brown"
                  />
                  {/* Door Swing Arc */}
                  <Path
                    x={6} // Offset to align with the rectangle
                    y={0}
                    data="M 0 0 A 80 80 0 0 1 80 80" // Arc for door swing
                    stroke="black"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </Group>
              )}
              {obj.type === "window" && (
                <Group>
                  {/* Outer Frame */}
                  <Rect
                    x={0}
                    y={0}
                    width={100}
                    height={20}
                    stroke="black"
                    strokeWidth={2}
                    fill="white"
                  />
                  {/* Left and Right Sections */}
                  <Line
                    points={[20, 0, 20, 20]}
                    stroke="black"
                    strokeWidth={2}
                  />
                  <Line
                    points={[80, 0, 80, 20]}
                    stroke="black"
                    strokeWidth={2}
                  />
                  {/* Inner Fixed Middle Section */}
                  <Rect
                    x={25}
                    y={5}
                    width={50}
                    height={10}
                    stroke="black"
                    strokeWidth={2}
                    fill="white"
                  />
                </Group>
              )}
              {obj.type === "text" && (
                <Text
                  x={0}
                  y={0}
                  text={obj.text}
                  fontSize={20}
                  fill="black"
                  width={obj.width}
                  height={obj.height}
                  onDblClick={() => handleTextDoubleClick(obj.id, obj.text)}
                />
              )}
            </Group>
          ))}
          <Transformer
            ref={transformerRef}
            enabledAnchors={["middle-left", "middle-right"]}
          />
        </Layer>
      </Stage>
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 40,
          display: "flex",
          gap: "10px",
          background: "white",
          padding: "10px",
          borderRadius: "10px",
          opacity: 0.8,
        }}
      >
        <Button
          leftSection={<IconWall size={16} />}
          color="green"
          variant="light"
          onClick={() => addObject("wall")}
        >
          Wall
        </Button>
        <Button
          leftSection={<IconDoor size={16} />}
          color="green"
          variant="light"
          onClick={() => addObject("door")}
        >
          Door
        </Button>
        <Button
          leftSection={<IconWindow size={16} />}
          color="green"
          variant="light"
          onClick={() => addObject("window")}
        >
          Window
        </Button>
        <Button
          leftSection={<IconTextSize size={16} />}
          color="blue"
          variant="light"
          onClick={() => addObject("text")}
        >
          Text
        </Button>
        <Button
          leftSection={<IconTrashXFilled size={16} />}
          onClick={handleDelete}
          variant="light"
          color="red"
        >
          Bin
        </Button>
      </div>
      {editingTextId && (
        <div style={{ position: "absolute", top: 20, right: 150 }}>
          <TextInput
            value={textValue}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            placeholder="Edit text"
          />
        </div>
      )}
      <Button
        onClick={exportCanvas}
        variant="gradient"
        gradient={{
          from: "rgb(189, 253, 162)",
          to: "rgba(80, 191, 40, 1)",
          deg: 153,
        }}
        style={{ position: "absolute", top: 20, right: 40 }}
      >
        Export ✨
      </Button>
    </Container>
  );
};

export default FloorPlanner;
