SELECT
	row_to_json (c)
FROM
	(SELECT
		'FeatureCollection' as type,
		array_to_json (array_agg (b)) as features
	FROM
		(SELECT
			'Feature' as type,
			ST_AsGeoJson (wkb_geometry)::json as geometry,
			(WITH data (name, geoid, votes, winner, trumpd, clintonh, other) AS (VALUES (name, geoid, votes, winner, trumpd, clintonh, other)) SELECT row_to_json (data) FROM data) as properties
		FROM
			(SELECT
				wkb_geometry,
				c.name,
				c.geoid,
				v.*
			FROM
				counties c 
					LEFT JOIN counties_data d ON c.geoid = d.id2
					LEFT JOIN votes v ON c.geoid = v.fips
			) as a
		) as b
	) as c
