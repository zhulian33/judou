/** 主要城市经度（东经，度）。排盘按真太阳时，需要经度。 */
export const PLACES: Array<{ name: string; longitude: number }> = [
  { name: "北京", longitude: 116.41 },
  { name: "上海", longitude: 121.47 },
  { name: "广州", longitude: 113.26 },
  { name: "深圳", longitude: 114.06 },
  { name: "天津", longitude: 117.2 },
  { name: "重庆", longitude: 106.55 },
  { name: "成都", longitude: 104.07 },
  { name: "杭州", longitude: 120.15 },
  { name: "南京", longitude: 118.8 },
  { name: "武汉", longitude: 114.3 },
  { name: "西安", longitude: 108.94 },
  { name: "苏州", longitude: 120.58 },
  { name: "长沙", longitude: 112.94 },
  { name: "郑州", longitude: 113.62 },
  { name: "青岛", longitude: 120.38 },
  { name: "沈阳", longitude: 123.43 },
  { name: "大连", longitude: 121.62 },
  { name: "哈尔滨", longitude: 126.53 },
  { name: "长春", longitude: 125.32 },
  { name: "济南", longitude: 117.0 },
  { name: "合肥", longitude: 117.28 },
  { name: "福州", longitude: 119.3 },
  { name: "厦门", longitude: 118.09 },
  { name: "南昌", longitude: 115.89 },
  { name: "昆明", longitude: 102.83 },
  { name: "贵阳", longitude: 106.63 },
  { name: "南宁", longitude: 108.37 },
  { name: "海口", longitude: 110.2 },
  { name: "石家庄", longitude: 114.51 },
  { name: "太原", longitude: 112.55 },
  { name: "呼和浩特", longitude: 111.75 },
  { name: "兰州", longitude: 103.82 },
  { name: "西宁", longitude: 101.78 },
  { name: "银川", longitude: 106.23 },
  { name: "乌鲁木齐", longitude: 87.62 },
  { name: "拉萨", longitude: 91.11 },
  { name: "香港", longitude: 114.17 },
  { name: "澳门", longitude: 113.54 },
  { name: "台北", longitude: 121.56 },
  { name: "新加坡", longitude: 103.82 },
  { name: "东京", longitude: 139.69 },
  { name: "首尔", longitude: 126.98 },
  { name: "纽约", longitude: -74.01 },
  { name: "洛杉矶", longitude: -118.24 },
  { name: "伦敦", longitude: -0.13 },
  { name: "悉尼", longitude: 151.21 },
];

export const DEFAULT_LONGITUDE = 120; // 东八区标准经线

export function findPlaceLongitude(name?: string): number | null {
  if (!name) return null;
  const hit = PLACES.find((item) => item.name === name.trim());
  return hit ? hit.longitude : null;
}
