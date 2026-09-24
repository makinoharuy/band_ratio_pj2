//definition image landsat 8 
var proj = 'EPSG:32749'; 

var landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') 
  .filterBounds(shp)
  .filter(ee.Filter.eq('PROCESSING_LEVEL', 'L2SP'))
  .filter(ee.Filter.lt('CLOUD_COVER', 30))
  .filterDate('2021-01-01', '2021-12-31')

print('Jumlah Citra:', landsat.size());

// cloud masking
function cloud_mask(img_cloud) {
  var qa = img_cloud.select('QA_PIXEL');
  
  // Bit 1: Dilated Cloud, Bit 2: Cirrus, Bit 3: Cloud, Bit 4: Cloud Shadow
  var dilatedCloudBit = 1 << 1
  var cirrusBit = 1 << 2
  var cloudBit = 1 << 3
  var shadowBit = 1 << 4

  // masking)
  var mask = qa.bitwiseAnd(dilatedCloudBit).eq(0)
             .and(qa.bitwiseAnd(cirrusBit).eq(0))
             .and(qa.bitwiseAnd(cloudBit).eq(0))
             .and(qa.bitwiseAnd(shadowBit).eq(0))
             
  return img_cloud.updateMask(mask);
}

// cloud masking
var landsat_clean = landsat.map(cloud_mask)

// 3. scalling factor 
function scale(img_scale) {
  // Optical bands: scale factor 0.0000275 + offset -0.2
  var opticalBands = img_scale.select('SR_B.*').multiply(0.0000275).add(-0.2);
  
  // Thermal bands: scale factor 0.00341802 + offset 149.0
  var thermalBands = img_scale.select('ST_B.*').multiply(0.00341802).add(149.0);
  
  // Return the original image with scaled bands overwritten
  return img_scale.addBands(opticalBands, null, true)
                  .addBands(thermalBands, null, true)
}

// median composite
var composite = landsat_clean.median()
var citra = scale(composite).clip(geometry)

// visualization
var visParams = {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0.0,
  max: 0.3
};

Map.centerObject(shp, 10);
Map.addLayer(citra, visParams, 'Citra RGB Landsat 8')

var rembangClip = citra.clip(shp)
Map.addLayer(rembangClip, visParams, 'Citra Kabupaten Rembang Landsat 8')
