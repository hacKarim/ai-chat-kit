# Component: Record Button

## Format
```record-button
{
  "id": "string",
  "title": "string",
  "description": "string",
  "startLabel": "string",
  "stopLabel": "string",
  "processingLabel": "string",
  "autoSend": true,
  "promptPrefix": "string",
  "variant": "default" | "destructive" | "outline" | "secondary" | "ghost",
  "size": "default" | "sm" | "lg" | "icon",
  "showWaveform": true
}
```

## Fields

### Required
- `id` (string): Unique identifier

### Optional
- `title` (string): Component title
- `description` (string): Component description
- `startLabel` (string): Start recording label [default: "Start recording"]
- `stopLabel` (string): Stop recording label [default: "Stop"]
- `processingLabel` (string): Processing label [default: "Processing..."]
- `autoSend` (boolean): Auto-send transcript [default: false]
- `promptPrefix` (string): Prefix for transcript message
- `variant` (string): Button variant [default: "default"]
- `size` (string): Button size [default: "default"]
- `showWaveform` (boolean): Show audio waveform [default: true]
- `responseActions` (array): Follow-up actions

## Example
```record-button
{
  "id": "record-standup",
  "title": "Record the stand-up",
  "description": "Talk as usual. You get notes and action items when you stop.",
  "startLabel": "Start recording",
  "processingLabel": "Transcribing...",
  "autoSend": true,
  "promptPrefix": "Here is the stand-up transcript. Turn it into notes and action items:\n\n"
}
```
