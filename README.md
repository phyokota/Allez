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

![Dataset in excel](https://github.com/phyokota/Allez/blob/0903943f743f249943c9b8c213b24d23d8e058ce/climbharder_data_excel.png)

Some columns have multiple entries of weird values but thats a job for python to clean.

Started python data cleaning, logging progress in ipynb cleand first 6 cols.

5/14/2026

Finished cleaning all 20 columns using pandas in vscode, removed the last two which consisted of max pullups with added weight because users got confused with lbs and kgs so the data was too messy and max pushups which do not really correlate with climbing well. Exported back into a excel file to be uploaded and used in supabase.

5/15

Here is the cleaned data back into an excel sheet: 

![Cleaned Dataset](https://github.com/phyokota/Allez/blob/25c6f5cb03bc33fb2b1a3e20e354f9b64922277b/cleaned_climbharder_data.png)

5/18

Today I learned how to connect supabase to my react application.
There are three main steps
1. npm install @supabase/supabase-js
2. create .env.local and input the vite_supabase_url and vite_supabase_anon_key which are both located in supabase under the project
3. supabaseClient.js to allow for the connection to supabase

I also finally connected my github repo to the project.

5/20

Let us begin setting up the variables that will make up the website.

I want each row to have 3 items, so multiples of 3 would be ideal, I'm thinking 6 or 9 benchmarks based off the data set.

So there are two variables, Max Grade and Project Grade. Looking through the data, I found that Max Grade was very inconsistent because the highest grade some people climbed was way higher than normal grade range. I assume this is largely because of a combination of misgraded climbs, being very soft, or climbs that highly suited the climbing style of the individual. Therefore, project grade is a more accurate representation.

Im going to create 7 buckets based on skill.

v0-1 = bronze
v1-2 = silver
v2-4 = gold
v4-6 = platinum
v6-8 = diamond
v8-10 = masters
v10-v12 = grandmasters
v12+ = professional

But these buckets will apply to other metrics as well.

After adding max hang and min edge metrics, I found that the data is much more sparse for the half crimp rather than the open crimp.

5/22

Lets make a simple visual of grade climbed vs years climbing.

![Project_boulder](https://github.com/phyokota/Allez/blob/70b6d922820c0bf4c6138af24414279219e74680/histogram.png)
![Max_boulder](https://github.com/phyokota/Allez/blob/d94326cf07c6c32d73cd2155d2e2e28e8ff009d9/max_boulder.png)

What do we notice? Well it seems like the median goes from v4 to v6 between project boulders and max boulders. Why might this be the case. Well max boulder describes the highest grade someone climbed taking in account the fact that the boulder might be soft, or fit someones style of climbing perfectly. It's very likely that some people have climbed a boulder that isn't representative of their true grade level. Thus, the project boulder histogram better represents the data.

I've decided to focus on four metrics.

1. Project grade
2. Max hang on 20m (open crimp)
3. Min edge hang (open crimp)
4. pullups

Here is what the current site looks like, its a very rough sketch but taking this step by step
![Website_v1](https://github.com/phyokota/Allez/blob/7bd0dec6789607e9e2982f09909d241e9989444c/website_v1.png)

5/26

I created the 4 tabs of the website that I'm going to use including, Benchmarks, Input Metrics, Grade Calculator, and Distributions (might change name later)

Created two ipynb files in order to play with the data more and find good rankings for the input metrics tab.





