import { useContext, useEffect, useRef, useState } from "react";
import { RgbaStringColorPicker } from "react-colorful";
import { BiCircle, BiExport, BiRectangle } from "react-icons/bi";
import {
  BsArrowUpRight,
  BsFillEraserFill,
  BsFillGrid1X2Fill,
  BsFillImageFill,
  BsFillPencilFill,
  BsFillStickyFill,
  BsFillTrashFill,
  BsHandIndexThumbFill,
  BsTriangle,
} from "react-icons/bs";
import { FaSave } from "react-icons/fa";
import { HiCog8Tooth } from "react-icons/hi2";
import { ImRedo, ImUndo } from "react-icons/im";
import { IoShapes } from "react-icons/io5";
import { MdTextFields } from "react-icons/md";
import Dropdown from "./Dropdown";
import { fabric } from "./FabricExtended";
import { WhiteboardContext } from "./WhiteboardStore";

interface IProps {
  className?: string;
  options?: object;
  onChange?: any;
  data: any;
  saveDataToDB?: (data: any, id: string) => void;
}

const bottomMenu = [
  { title: "Show Object Options", icon: <HiCog8Tooth /> },
  { title: "Grid", icon: <BsFillGrid1X2Fill /> },
  { title: "Erase", icon: <BsFillEraserFill /> },
  { title: "Undo", icon: <ImUndo /> },
  { title: "Redo", icon: <ImRedo /> },
  { title: "Save", icon: <FaSave /> },
  { title: "Export", icon: <BiExport /> },
  // { title: "ToJson", icon: <JsonIcon /> },
  { title: "Clear", icon: <BsFillTrashFill /> },
];

const toolbar = [
  { title: "Select", icon: <BsHandIndexThumbFill /> },
  { title: "Draw", icon: <BsFillPencilFill /> },
  { title: "Text", icon: <MdTextFields /> },
  { title: "Sticky", icon: <BsFillStickyFill /> },
  { title: "Arrow", icon: <BsArrowUpRight /> },
  {
    title: "Line",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        fill="currentColor"
        viewBox="0 0 22 512"
      >
        <path d="M64 448C64 465.7 49.67 480 32 480C14.33 480 0 465.7 0 448V64C0 46.33 14.33 32 32 32C49.67 32 64 46.33 64 64V448zM192 64V448z"></path>
      </svg>
    ),
  },
];

let currentCanvas: any = null;

export function CanvasEditor({ onChange, className, options, data, saveDataToDB }: IProps) {
  const parentRef = useRef<any>();
  const canvasRef = useRef<any>();
  const inputImageFileRef = useRef<any>();
  const inputJsonFileRef = useRef<any>();

  const { gstate, setGState } = useContext(WhiteboardContext);
  const { canvasOptions, backgroundImage } = gstate;

  const [editor, setEditor] = useState<any>();

  const [objOptions, setObjOptions] = useState({
    stroke: "#000000",
    fontSize: 22,
    fill: "rgba(255, 255, 255, 0.0)",
    strokeWidth: 3,
    ...options,
  });

  const [colorProp, setColorProp] = useState<string>("background");

  const [showObjOptions, setShowObjOptions] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const canvasModifiedCallback = () => {
    if (currentCanvas) {
      onChange(currentCanvas.toDatalessJSON());
    }
  };

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef?.current, canvasOptions);
    currentCanvas = canvas;
    setEditor(canvas);

    const onKeydown = (e: KeyboardEvent) => {
      if (!canvas) return;

      if (e.code === "Delete" || e.keyCode === 46 || e.which === 46) {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          canvas.remove(activeObject);
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 67 || e.which === 67)) {
        const object = fabric.util.object.clone(canvas.getActiveObject());
        object.set("top", object.top + 5);
        object.set("left", object.left + 5);
        canvas.add(object);
      }

      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 83 || e.which === 83)) {
        e.preventDefault();
        saveDataToDB?.(JSON.stringify(canvas.toDatalessJSON()), data?.$id);
      }

      // if ((e.ctrlKey || e.metaKey) && (e.keyCode === 79 || e.which === 79)) {
      //   e.preventDefault();
      //   inputImageFileRef.current.click();
      // }

      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 90 || e.which === 90)) {
        e.preventDefault();
        // @ts-ignore: Unreachable code error
        canvas.undo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 89 || e.which === 89)) {
        e.preventDefault();
        // @ts-ignore: Unreachable code error
        canvas.redo();
      }
    };

    if (parentRef && parentRef.current && canvas) {
      // canvas.on('mouse:down', function (event) {
      //   setShowObjOptions(canvas.getActiveObject() ? true : false)
      // });

      if (onChange) {
        canvas.on("object:added", canvasModifiedCallback);
        canvas.on("object:removed", canvasModifiedCallback);
        canvas.on("object:modified", canvasModifiedCallback);
      }

      canvas.setHeight(parentRef.current?.clientHeight || 0);
      canvas.setWidth(parentRef.current?.clientWidth || 0);
      canvas.renderAll();

      document.addEventListener("keydown", onKeydown, false);
    }

    return () => {
      canvas.off("object:added", canvasModifiedCallback);
      canvas.off("object:removed", canvasModifiedCallback);
      canvas.off("object:modified", canvasModifiedCallback);

      //canvas.off('mouse:down');
      document.removeEventListener("keydown", onKeydown, false);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!data || !data?.data || !editor) return;
    try {
      let json = JSON.parse(data?.data || "{}");
      editor.loadFromJSON(json, (v: any) => {
        console.log(v);
      });
    } catch {
      console.error("error");
    }
  }, [data, editor]);

  const onToolbar = (objName: string) => {
    let objType;

    switch (objName) {
      case "Select":
        editor.isDrawingMode = false;
        editor.discardActiveObject().renderAll();
        break;

      case "Draw":
        if (editor) {
          editor.isDrawingMode = true;
          editor.freeDrawingBrush.width = localStorage.getItem("freeDrawingBrush.width") || 5;
          editor.freeDrawingBrush.color =
            localStorage.getItem("freeDrawingBrush.color") || "#000000";
        }
        break;

      case "Text":
        editor.isDrawingMode = false;
        objType = new fabric.Textbox("Your text here", { fontSize: objOptions.fontSize });
        break;

      case "Circle":
        editor.isDrawingMode = false;
        objType = new fabric.Circle({ ...objOptions, radius: 70 });
        break;

      case "Rect":
        editor.isDrawingMode = false;
        objType = new fabric.Rect({ ...objOptions, width: 100, height: 100 });
        break;

      case "Triangle":
        editor.isDrawingMode = false;
        objType = new fabric.Triangle({ ...objOptions, width: 100, height: 100 });
        break;

      case "Arrow":
        editor.isDrawingMode = false;
        const triangle = new fabric.Triangle({
          ...objOptions,
          width: 10,
          height: 15,
          left: 235,
          top: 65,
          angle: 90,
        });

        const line = new fabric.Line([50, 100, 200, 100], { ...objOptions, left: 75, top: 70 });

        objType = new fabric.Group([line, triangle]);
        break;

      case "Line":
        editor.isDrawingMode = false;
        objType = new fabric.Line([50, 10, 200, 150], { ...objOptions, angle: 47 });
        break;

      case "Sticky":
        objType = new fabric.Textbox("Your text here", {
          ...objOptions,
          backgroundColor: "#8bc34a",
          fill: "#fff",
          width: 150,
          textAlign: "left",
          splitByGrapheme: true,
          height: 150,
          padding: 20,
        });
        break;

      default:
        break;
    }

    if (objName !== "Draw" && objName !== "Select") {
      editor.add(objType);
      editor.centerObject(objType);
    }

    editor.renderAll();
  };

  const onBottomMenu = (actionName: string) => {
    switch (actionName) {
      case "Show Object Options":
        setShowObjOptions(!showObjOptions);
        break;

      case "Export":
        const image = editor.toDataURL("image/png").replace("image/png", "image/octet-stream");
        window.open(image);
        break;

      case "Save":
        saveDataToDB?.(JSON.stringify(editor.toDatalessJSON()), data?.$id);
        break;

      case "Erase":
        const activeObject = editor.getActiveObject();
        if (activeObject) {
          editor.remove(activeObject);
        }
        break;

      case "ToJson":
        const content = JSON.stringify(editor.toDatalessJSON());
        const link = document.createElement("a");
        const file = new Blob([content], { type: "application/json" });
        link.setAttribute("download", "whiteboard.json");
        link.href = URL.createObjectURL(file);
        document.body.appendChild(link);
        link.click();
        link.remove();
        break;

      case "Undo":
        editor.undo();
        break;

      case "Redo":
        editor.redo();
        break;

      case "Grid":
        setShowGrid(!showGrid);
        break;

      case "Clear":
        if (confirm("Are you sure to reset the whiteboard? It'll remove from db too")) {
          saveDataToDB?.("", data?.$id);
          editor.clearHistory();
          editor.clear();
        }
        break;

      default:
        break;
    }
  };

  const onFileChange = (e: any) => {
    // console.log(e.target.files.length);

    if (e.target.files.length < 1) return;

    const inputFileName = e.target.name;
    const file = e.target.files[0];
    const fileType = file.type;
    const url = URL.createObjectURL(file);

    if (inputFileName === "json") {
      fetch(url)
        .then((r) => r.json())
        .then((json) => {
          editor.loadFromJSON(json, (v: any) => {
            console.log(v);
          });
        });
    } else {
      if (fileType === "image/png" || fileType === "image/jpeg") {
        fabric.Image.fromURL(
          url,
          function (img: { set: (arg0: { width: number; height: number }) => void }) {
            img.set({ width: 180, height: 180 });
            editor.centerObject(img);
            editor.add(img);
          }
        );
      }

      if (fileType === "image/svg+xml") {
        fabric.loadSVGFromURL(url, function (objects: any, options: any) {
          var svg = fabric.util.groupSVGElements(objects, options);
          svg.scaleToWidth(180);
          svg.scaleToHeight(180);
          editor.centerObject(svg);
          editor.add(svg);
        });
      }
    }
  };

  const onRadioColor = (e: any) => {
    setColorProp(e.target.value);
  };

  const onColorChange = (value: any) => {
    const activeObj = editor.getActiveObject();

    if (editor.isDrawingMode) {
      editor.freeDrawingBrush.color = value;
      localStorage.setItem("freeDrawingBrush.color", value);
    }
    if (activeObj) {
      activeObj.set(colorProp, value);
      const ops = { ...objOptions, [colorProp]: value };
      setObjOptions(ops);
      editor.renderAll();
    } else {
      if (colorProp === "backgroundColor") {
        editor.backgroundColor = value;
        editor.renderAll();
      }
    }
  };

  const onOptionsChange = (e: any) => {
    let val = e.target.value;
    const name = e.target.name;
    const activeObj = editor.getActiveObject();

    if (editor.isDrawingMode && name === "strokeWidth") {
      editor.freeDrawingBrush.width = val;
      localStorage.setItem("freeDrawingBrush.width", val);
    }

    if (activeObj) {
      val = isNaN(val) ? val : +val;
      activeObj.set(name, val);

      const ops = { ...objOptions, [name]: val };
      setObjOptions(ops);
      editor.renderAll();
    }
  };

  const onZoom = (e: any) => {
    editor.zoomToPoint(new fabric.Point(editor.width / 2, editor.height / 2), +e.target.value);
    const units = 10;
    const delta = new fabric.Point(units, 0);
    editor.relativePan(delta);

    e.preventDefault();
    e.stopPropagation();
  };

  // const onLoadImage = () => {
  //   inputImageFileRef.current.click();
  // };

  // const onLoadFromJson = () => {
  //   inputJsonFileRef.current.click();
  // };

  return (
    <div
      className={"w-full h-100 whiteboard " + className}
      style={{ backgroundImage: showGrid ? backgroundImage : "" }}
      ref={parentRef}
    >
      {showObjOptions && (
        <div className="left-menu ml-4">
          <select
            className="items-center bg-black-primary w-full h-10 br-7 shadow border-0 pr-1 pl-1 flex sm:hidden mb-2"
            onChange={onZoom}
            defaultValue="1"
          >
            <option value="2">200%</option>
            <option value="1.5">150%</option>
            <option value="1">100%</option>
            <option value="0.75">75%</option>
            <option value="0.50">50%</option>
            <option value="0.25">25%</option>
          </select>
          <div className="bg-black-primary flex items-center justify-between shadow br-7">
            <label>Font size</label>
            <input
              type="number"
              min="1"
              name="fontSize"
              onChange={onOptionsChange}
              defaultValue="22"
            />
          </div>

          <div className="bg-black-primary flex items-center justify-between shadow br-7">
            <label>Stroke</label>
            <input
              type="number"
              min="1"
              name="strokeWidth"
              onChange={onOptionsChange}
              defaultValue="3"
            />
          </div>

          <div className="bg-black-primary flex flex-column shadow br-7">
            <div className="flex align-end mb-10">
              <input
                className="mr-10"
                type="radio"
                onChange={onRadioColor}
                name="color"
                defaultValue="backgroundColor"
              />
              <label htmlFor="backgroundColor">background</label>
            </div>
            <div className="flex align-end mb-10">
              <input
                className="mr-10"
                type="radio"
                onChange={onRadioColor}
                id="stroke"
                name="color"
                defaultValue="stroke"
              />
              <label htmlFor="stroke">stroke</label>
            </div>

            <div className="flex align-end mb-10">
              <input
                className="mr-10"
                type="radio"
                onChange={onRadioColor}
                id="fill"
                name="color"
                defaultValue="fill"
              />
              <label htmlFor="fill">fill</label>
            </div>

            <RgbaStringColorPicker onChange={onColorChange} />
          </div>
        </div>
      )}

      <div className="w-full flex justify-center items-center fixed top-[100px] sm:top-3 left-0 z-[9999]">
        <div className="bg-black-primary flex justify-center items-center shadow br-7">
          {toolbar.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                onToolbar(item.title);
              }}
              title={item.title}
            >
              {item.icon}
            </button>
          ))}
          <Dropdown title={<IoShapes />}>
            <button
              onClick={() => {
                onToolbar("Circle");
              }}
              title="Add Circle"
            >
              <BiCircle />
            </button>
            <button
              onClick={() => {
                onToolbar("Rect");
              }}
              title="Add Rectangle"
            >
              <BiRectangle />
            </button>
            <button
              onClick={() => {
                onToolbar("Triangle");
              }}
              title="Add Triangle"
            >
              <BsTriangle />
            </button>
          </Dropdown>
          {/* <button
            onClick={() => {
              onLoadImage();
            }}
            title="Load Image"
          >
            <BsFillImageFill />
          </button> */}
          {/* <button
            onClick={() => {
              onLoadFromJson();
            }}
            title="Load From Json"
          >
            Json
          </button> */}
        </div>
      </div>

      <canvas ref={canvasRef} className="canvas" />

      <div className="w-full bottom-menu flex sm:gap-x-4 justify-center">
        <div className="flex items-center bg-black-primary br-7 shadow">
          {bottomMenu.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                onBottomMenu(item.title);
              }}
              title={item.title}
            >
              {item.icon}
            </button>
          ))}
        </div>

        <select
          className="items-center bg-black-primary br-7 shadow border-0 pr-1 pl-1 hidden sm:flex"
          onChange={onZoom}
          defaultValue="1"
        >
          <option value="2">200%</option>
          <option value="1.5">150%</option>
          <option value="1">100%</option>
          <option value="0.75">75%</option>
          <option value="0.50">50%</option>
          <option value="0.25">25%</option>
        </select>

        <input
          ref={inputImageFileRef}
          type="file"
          name="image"
          onChange={onFileChange}
          accept="image/svg+xml, image/gif, image/jpeg, image/png"
          hidden
        />
        <input
          ref={inputJsonFileRef}
          type="file"
          name="json"
          onChange={onFileChange}
          accept="application/json"
          hidden
        />
      </div>
    </div>
  );
}
