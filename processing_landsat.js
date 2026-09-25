// var band = {
//   swir : citra.select('SR_B6'),
//   nir : citra.select('SR_B5'),
//   red : citra.select('SR_B4'),
//   green : citra.select('SR_B3')
// }

var ndvi = citra.normalizedDifference(['SR_B5','SR_B4']).rename('NDVI')
var ndbi = citra.normalizedDifference(['SR_B6','SR_B5']).rename('NDBI')
var ndwi = citra.normalizedDifference(['SR_B3','SR_B5']).rename('NDWI')

var paramsNDVI = {min:-1,max:1,palette:
  ['blue','white','green']
}

var paramsNDBI = {min:-1,max:1,palette:
  ['green','white','red']
}

var paramsNDWI = {min:-1,max:1,palette:
  ['brown','white','blue']
}

// Map.addLayer(ndvi, paramsNDVI, 'NDVI')
// Map.addLayer(ndbi, paramsNDBI, 'NDBI')
// Map.addLayer(ndwi, paramsNDWI, 'NDWI')

var ndviClip = ndvi.clip(shp)
var ndbiClip = ndbi.clip(shp)
var ndwiClip = ndwi.clip(shp)

Map.addLayer(ndviClip, paramsNDVI, 'NDVI')
Map.addLayer(ndbiClip, paramsNDBI, 'NDBI')
Map.addLayer(ndwiClip, paramsNDWI, 'NDWI')

var lst = citra.select('ST_B10').subtract(273.15).rename('LST')
// Map.addLayer(lst, {palette:['blue','yellow','orange','red'],min:20,max:40},'LST Celcius')

var lstClip = lst.clip(shp)
Map.addLayer(lstClip, {palette:['blue', 'cyan', 'green', 'yellow', 'red'],min:20,max:40},'LST Celcius')

// var ndviCalc = citra.expression('(nir - red)/(nir + red)', band).rename('NDVI Calc')


// var rembangClip = citra.clip(shp)
// Map.addLayer(rembangClip, visParams, 'Citra Kabupaten Rembang Landsat 8')

var lst = citra.select('ST_B10').subtract(273.15).rename('LST')
// Map.addLayer(lst, {palette:['blue','yellow','orange','red'],min:20,max:40},'LST Celcius')

var lstClip = lst.clip(shp)
Map.addLayer(lstClip, {palette:['blue', 'cyan', 'green', 'yellow', 'red'],min:20,max:40},'LST Celcius')

// var ndviCalc = citra.expression('(nir - red)/(nir + red)', band).rename('NDVI Calc')


// var rembangClip = citra.clip(shp)
// Map.addLayer(rembangClip, visParams, 'Citra Kabupaten Rembang Landsat 8')

// pendefinisian kelas
var water = ndwiClip.gt(0.1)
var built_up = ndbiClip.gt(0).and(water.eq(0))
var vegetation = ndviClip.gt(0.2).and(water.eq(0)).and(built_up.eq(0))
Map.addLayer(water.selfMask(), {palette:['blue']}, 'Air')
Map.addLayer(built_up.selfMask(), {palette:['red']}, 'Bangunan')
Map.addLayer(vegetation.selfMask(), {min:0,max:1,palette:['white','green']}, 'Vegetasi')

function calcLuas(mask, nama){
  var luas = mask
  .selfMask()
  .multiply(ee.Image.pixelArea())
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: shp.geometry(),
    scale: 30,
    maxPixels: 1e10
  })
  
  var ha = ee.Number(luas.values().get(0)).divide(1e4)
  print(ee.String('Luas ').cat(nama).cat(' (Hektar): ').cat(ha.format('%.2f')))
  4
}

calcLuas(water, 'Air')
calcLuas(built_up, 'Bangunan')
calcLuas(vegetation, 'Vegetasi')

Export.image.toDrive({
  image: lstClip,
  description: 'LST_2025',
  folder : 'praktikum_pj2',
  region : shp.geometry(),
  scale : 30,
  maxPixels : 1e13,
  fileFormat : 'GeoTIFF'
})

