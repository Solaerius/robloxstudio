const LUAU_LINES = [
  "local RunService = game:GetService(\"RunService\")",
  "local Debris = game:GetService(\"Debris\")",
  "local Projectile = {}",
  "function Projectile.new(Gravity, Whitelist, Wind, DespawnTime, Visualize)",
  "\tlocal newProjectile = {}",
  "\tnewProjectile.Gravity = Gravity",
  "\tnewProjectile.Wind = Wind",
  "\tnewProjectile.DespawnTime = DespawnTime",
  "\tnewProjectile.Visualize = Visualize",
  "\tnewProjectile.Params = RaycastParams.new()",
  "\tnewProjectile.Params.FilterType = Enum.RaycastFilterType.Whitelist",
  "\tnewProjectile.Params.FilterDescendantsInstances = Whitelist",
  "\tfunction newProjectile:Cast(start, dest, force)",
  "\t\tlocal conversion = 196.2/9.8",
  "\t\tlocal vForce = (dest - start).Unit * force * conversion",
  "\t\tlocal a = Vector3.new(self.Wind.X, self.Wind.Y - self.Gravity * 9.8, self.Wind.Z) * conversion",
  "\t\tlocal t = 0",
  "\t\tlocal currentPos = start",
  "\t\tlocal rayResult = nil",
  "\t\tlocal found = false",
  "\t\tlocal Connection = RunService.Heartbeat:Connect(function(dt)",
  "\t\t\tif not found then",
  "\t\t\t\tt += dt",
  "\t\t\t\tlocal projPos = Vector3.new(",
  "\t\t\t\t\tstart.X+vForce.X*t+0.5*a.X*t*t,",
  "\t\t\t\t\tstart.Y+vForce.Y*t+0.5*a.Y*t*t,",
  "\t\t\t\t\tstart.Z+vForce.Z*t+0.5*a.Z*t*t",
  "\t\t\t\t)",
  "\t\t\t\trayResult = workspace:Raycast(currentPos, projPos - currentPos, self.Params)",
  "\t\t\t\tcurrentPos = projPos",
  "\t\t\t\tif self.Visualize then",
  "\t\t\t\t\tlocal Part = Instance.new(\"Part\")",
  "\t\t\t\t\tPart.Size = Vector3.new(0.5,0.5,0.5)",
  "\t\t\t\t\tPart.Position = projPos",
  "\t\t\t\t\tPart.Anchored = true",
  "\t\t\t\t\tPart.CanCollide = false",
  "\t\t\t\t\tPart.Material = Enum.Material.Neon",
  "\t\t\t\t\tPart.Color = Color3.fromRGB(0, 255, 0)",
  "\t\t\t\t\tPart.Shape = \"Ball\"",
  "\t\t\t\t\tPart.Parent = workspace.Trash",
  "\t\t\t\t\tDebris:AddItem(Part, 0.5)",
  "\t\t\t\tend",
  "\t\t\t\tif rayResult or t > self.DespawnTime then",
  "\t\t\t\t\tfound = true",
  "\t\t\t\tend",
  "\t\t\tend",
  "\t\tend)",
  "\t\twhile not found do",
  "\t\t\twait()",
  "\t\tend",
  "\t\tConnection:Disconnect()",
  "\t\tif rayResult then",
  "\t\t\tlocal hit = rayResult.Instance",
  "\t\t\tif hit.Parent:FindFirstChild(\"Humanoid\") then",
  "\t\t\t\thit.Parent.Humanoid:TakeDamage(10)",
  "\t\t\tend",
  "\t\t\tif self.Visualize then",
  "\t\t\t\tlocal Part = Instance.new(\"Part\")",
  "\t\t\t\tPart.Size = Vector3.new(3,3,3)",
  "\t\t\t\tPart.Position = rayResult.Position",
  "\t\t\t\tPart.Anchored = true",
  "\t\t\t\tPart.CanCollide = false",
  "\t\t\t\tPart.Material = Enum.Material.Neon",
  "\t\t\t\tPart.Color = Color3.fromRGB(0, 255, 0)",
  "\t\t\t\tPart.Shape = \"Ball\"",
  "\t\t\t\tPart.Parent = workspace.Trash",
  "\t\t\t\tDebris:AddItem(Part, 0.5)",
  "\t\t\tend",
  "\t\tend",
  "\tend",
  "\treturn newProjectile",
  "end",
  "return Projectile",
  "local StrokeUtils = {}",
  "function StrokeUtils.resample(points, n)",
  "\tlocal pts = table.create(#points)",
  "\tfor i, p in ipairs(points) do pts[i] = p end",
  "\tlocal totalLen = 0",
  "\tfor i = 2, #pts do",
  "\t\tlocal dx = pts[i].X - pts[i-1].X",
  "\t\tlocal dy = pts[i].Y - pts[i-1].Y",
  "\t\ttotalLen = totalLen + math.sqrt(dx*dx + dy*dy)",
  "\tend",
  "\tlocal interval = totalLen / (n - 1)",
  "\tlocal result = { pts[1] }",
  "\tlocal accumulated = 0",
  "\tlocal i = 2",
  "\twhile i <= #pts and #result < n do",
  "\t\tlocal dx = pts[i].X - pts[i-1].X",
  "\t\tlocal dy = pts[i].Y - pts[i-1].Y",
  "\t\tlocal d = math.sqrt(dx*dx + dy*dy)",
  "\t\tif accumulated + d >= interval then",
  "\t\t\tlocal t = (interval - accumulated) / d",
  "\t\t\tlocal newPt = Vector2.new(pts[i-1].X + t*dx, pts[i-1].Y + t*dy)",
  "\t\t\tresult[#result + 1] = newPt",
  "\t\t\ttable.insert(pts, i, newPt)",
  "\t\t\taccumulated = 0",
  "\t\t\ti = i + 1",
  "\t\telse",
  "\t\t\taccumulated = accumulated + d",
  "\t\t\ti = i + 1",
  "\t\tend",
  "\tend",
  "\twhile #result < n do",
  "\t\tresult[#result + 1] = pts[#pts]",
  "\tend",
  "\treturn result",
  "end",
  "function StrokeUtils.centroid(points)",
  "\tlocal sx, sy = 0, 0",
  "\tfor _, p in ipairs(points) do sx = sx + p.X; sy = sy + p.Y end",
  "\treturn Vector2.new(sx / #points, sy / #points)",
  "end",
  "function StrokeUtils.translate(points, offset)",
  "\tlocal result = table.create(#points)",
  "\tfor i, p in ipairs(points) do",
  "\t\tresult[i] = Vector2.new(p.X + offset.X, p.Y + offset.Y)",
  "\tend",
  "\treturn result",
  "end",
  "function StrokeUtils.scaleTo(points, squareSize)",
  "\tlocal minX, maxX, minY, maxY = math.huge, -math.huge, math.huge, -math.huge",
  "\tfor _, p in ipairs(points) do",
  "\t\tif p.X < minX then minX = p.X end",
  "\t\tif p.X > maxX then maxX = p.X end",
  "\t\tif p.Y < minY then minY = p.Y end",
  "\t\tif p.Y > maxY then maxY = p.Y end",
  "\tend",
  "\tlocal scale = squareSize / math.max(maxX - minX, maxY - minY, 1e-6)",
  "\tlocal result = table.create(#points)",
  "\tfor i, p in ipairs(points) do",
  "\t\tresult[i] = Vector2.new((p.X - minX) * scale, (p.Y - minY) * scale)",
  "\tend",
  "\treturn result",
  "end",
  "function StrokeUtils.rotate(points, center, angle)",
  "\tlocal c, s = math.cos(angle), math.sin(angle)",
  "\tlocal result = table.create(#points)",
  "\tfor i, p in ipairs(points) do",
  "\t\tlocal dx, dy = p.X - center.X, p.Y - center.Y",
  "\t\tresult[i] = Vector2.new(center.X + dx*c - dy*s, center.Y + dx*s + dy*c)",
  "\tend",
  "\treturn result",
  "end",
  "function StrokeUtils.boundingBox(points)",
  "\tlocal minX, maxX, minY, maxY = math.huge, -math.huge, math.huge, -math.huge",
  "\tfor _, p in ipairs(points) do",
  "\t\tif p.X < minX then minX = p.X end",
  "\t\tif p.X > maxX then maxX = p.X end",
  "\t\tif p.Y < minY then minY = p.Y end",
  "\t\tif p.Y > maxY then maxY = p.Y end",
  "\tend",
  "\treturn {",
  "\t\tminX = minX, minY = minY, maxX = maxX, maxY = maxY,",
  "\t\twidth = maxX - minX, height = maxY - minY,",
  "\t\tcenter = Vector2.new((minX + maxX) / 2, (minY + maxY) / 2),",
  "\t\tarea = (maxX - minX) * (maxY - minY),",
  "\t}",
  "end",
  "function StrokeUtils.indicativeAngle(points)",
  "\tlocal c = StrokeUtils.centroid(points)",
  "\treturn math.atan2(c.Y - points[1].Y, c.X - points[1].X)",
  "end",
  "function StrokeUtils.pathDistance(pts1, pts2)",
  "\tlocal d = 0",
  "\tlocal n = #pts1",
  "\tfor i = 1, n do",
  "\t\tlocal dx = pts1[i].X - pts2[i].X",
  "\t\tlocal dy = pts1[i].Y - pts2[i].Y",
  "\t\td = d + math.sqrt(dx*dx + dy*dy)",
  "\tend",
  "\treturn d / n",
  "end",
  "function StrokeUtils.pathLength(points)",
  "\tlocal len = 0",
  "\tfor i = 2, #points do",
  "\t\tlocal dx = points[i].X - points[i-1].X",
  "\t\tlocal dy = points[i].Y - points[i-1].Y",
  "\t\tlen = len + math.sqrt(dx*dx + dy*dy)",
  "\tend",
  "\treturn len",
  "end",
  "return StrokeUtils",
];

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

const LINE_HEIGHT = 18;
const FONT = '11px "JetBrains Mono", monospace';
const COLOR = 'rgba(232, 228, 240, 0.04)';
const NUM_COLS = 7;
const SPEEDS = [18, 28, 22, 36, 20, 30, 24];
const CYCLE_HEIGHT = LUAU_LINES.length * LINE_HEIGHT;

let cols = [];

function initCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Array.from({ length: NUM_COLS }, (_, i) => ({
    x: (canvas.width / (NUM_COLS + 1)) * (i + 1),
    y: -Math.random() * CYCLE_HEIGHT,
    speed: SPEEDS[i],
    lineIndex: Math.floor(Math.random() * LUAU_LINES.length),
  }));
}

window.addEventListener('resize', initCanvas);
initCanvas();

let lastTime = 0;

function tick(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = FONT;
  ctx.fillStyle = COLOR;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  for (const col of cols) {
    col.y -= col.speed * dt;
    if (col.y < -CYCLE_HEIGHT) col.y += CYCLE_HEIGHT;

    let y = col.y;
    let idx = col.lineIndex;

    while (y < canvas.height) {
      ctx.fillText(LUAU_LINES[idx % LUAU_LINES.length], col.x, y);
      y += LINE_HEIGHT;
      idx++;
    }
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
