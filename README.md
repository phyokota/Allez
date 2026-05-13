# Allez
Climbing Benchmark Database

5/12/2026

I needed to find a dataset for the climbing metrics, but most companies like lattice training and powercompany climbing do not publicly share their data.

However, I came across a reddit post where a user requested anyone with the time to fill out a survey regarding many intersting physical, spacial, and temporal attributes:


https://www.reddit.com/r/climbharder/comments/6693ua/climbharder_survey_results/


Upon downloading the dataset, I figured the first step would to be export it into excel and clean some of the columns up. Here is what it looks like before cleaning

![Dataset before cleaning](https://github.com/phyokota/Allez/blob/cba5128de3235c466fb51729b96a3d48b7194e00/climbharder_data_raw.png)

There are 35 columns which I changed to the following names:

timestamp
sex
height_cm
weight_kg
arm_span_cm
years_climbing
climbing_type
max_v_grade
max_v_grade_3m
project_v_grade
max_route_grade
max_route_grade_3m
project_route_grade
sessions_per_week
climbing_hours_per_week
training_hours_per_week
hangboard_freq_per_week
hangboard_grips
hangboard_style
max_hang_halfcrimp_18mm_kg
max_hang_opencrimp_18mm_kg
min_edge_halfcrimp_mm
min_edge_opencrimp_mm
campus_freq_per_week
campus_hours_per_week
endurance_freq_per_week
endurance_training_type
strength_freq_per_week
strength_hours_per_week
strength_training_type
other_activities
max_pullup_reps
weighted_pullup_5rm_kg
max_pushup_reps
max_lsit_sec

Some of the data isn't very valuable such as climbing_type (indoor/outdoor) and style of hangboarding (open/closed crimp), since an overwhelming majority of people who climb indoors also climb ourdoors and same with open and closed style crimping.

Also some columns not enough people inputted relevant data like endurance_training_type where most people didn't partake in.

Essentially, the columns where almost all climbers give the same input are not helpeful.

Here are the columns I deleted:

climbing_type
hangboard_grips
hangboard_style
hangboard_freq_per_week
campus_freq_per_week
campus_hours_per_week
endurance_freq_per_week
endurance_training_type
strength_training_type
other_activities
strength_freq_per_week
strength_hours_per_week
max_v_grade_3m
max_route_grade_3m
max_lsit_sec

So now we have 20 columns, with a focus on these:

(FOCUS SUBJECT TO CHANGE
project_v_grade
years_climbing
sessions_per_week
climbing_hours_per_week
weighted_pullup_5rm_kg
max_hang_halfcrimp_18mm_10s_kg
min_edge_halfcrimp_mm

5/13/2026

I then cleaned the dataset for weird values and standardizing the data like if people got mixed up with kg and lbs.

I replaced values like "I don't climb routes" or "I don't boulder" with blank values.

Some columns have multiple entries of weird values but thats a job for python to clean.



