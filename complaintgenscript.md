{
"seat": {
"subcategory": ["broken seat", "scratched seat", "dirty seat", "bedroll"],
"department": "Mechanical",
"role": "Sr. Divisional Mechanical Engineer (Carriage & Wagon)"
},
"window": {
"subcategory": ["cracked window", "dirty window", "broken window"],
"department": "Mechanical",
"role": "Sr. Divisional Mechanical Engineer (Carriage & Wagon)"
},
"food": {
"subcategory": ["spoilt/expired food", "food taste", "food quantity"],
"department": "Catering",
"role": "Sr. Divisional Catering Manager"
},
"compartment": {
"subcategory": ["garbage on coach"],
"department": "Hygiene",
"role": "Chief Hygiene Superintendent"
},
"toilet": {
"subcategory": ["unhygenic toilet", "unhygenic washbasin", "flush problem", "no water"],
"department": "Hygiene",
"role": "Chief Hygiene Superintendent"
},
"violence": {
"subcategory": ["staff violence/behaviour", "passenger violence", "bribery", "seat hijacking", "smoking/alcohol"],
"department": "Security",
"role": "Sr. Divisional Security Commissioner"
},
"management": {
"subcategory": ["train delay", "app issue", "missing items"],
"department": "Management",
"role": "Divisional Railway Manager"
},
"ticketing issue": {
"subcategory": ["wrong ticket", "money issue"],
"department": "Commercial",
"role": "Sr. Divisional Commercial Manager"
},
"security": {
"subcategory": ["robbery", "misbehaviour with lady passenger", "unauthorized person in ladies coach", "absence of security personnel"],
"department": "Security",
"role": "Sr. Divisional Security Commissioner"
},
"electricity": {
"subcategory": ["AC (Air Conditioner)", "Light", "Fan", "Charging Port"],
"department": "Electrical",
"role": "Sr. Divisional Electrical Engineer (General)"
},
"medical": {
"subcategory": ["First Aid Kit Requirement", "Medical Assistance"],
"department": "Medical",
"role": "Sr. Divisional Medical Engineer (General)"
}
}

Status

Pending
In Process
Completed

User

user1 - 6744a486505b78316465a18b

user2 - 6744a4b3505b78316465a18f

<!-- Add Complaint Single Dept -->

POST - http://localhost:3001/user/addcomplaint

{
"category": "Electricity",
"subcategory": "Fan",
"details": "Fan not working properly",
"ticketDetails": "",
"pnrNo": "7482799209",
"media": "image.jpg",
"metadata": {
"time": "2024-11-22T10:00:00Z",
"location": "Bandra"
},
"dept": "Electrical",
"severity": 7,
"dept2": "",
"category2": "",
"trainNo": "12123"
"userId" : "",
"zonal" : "centralrailway",
"division" : "mumbai",
"seatNo" : "M/32",
"nextStation" : "CSMT"
}

<!-- Add Complaint - Cross Dept -->

POST - http://localhost:3001/user/addcomplaint

{
"category": "Electricity",
"subcategory": "Fan",
"details": "Fan not working properly",
"ticketDetails": "",
"pnrNo": "7482799209",
"media": "image.jpg",
"metadata": {
"time": "2024-11-22T10:00:00Z",
"location": "Bandra"
},
"dept": "Electrical",
"severity": 7,
"dept2": "Mechanical",  
 "category2": "",
"trainNo": "12123",
"crossDeptAccept": 0,
"userId" : "",
"zonal" : "centralrailway",
"division" : "mumbai",
"seatNo" : "M/32",
"nextStation" : "CSMT"
}

<!-- Update Complaint Status -->

POST - http://localhost:3001/staff/updatecompstatus

{
"complaintId" : "674033756158b7f95e890722",
"status" : "Pending"
}

<!-- Submit Feedback -->

POST - http://localhost:3001/user/submitfeedback

{
"complaintId": "67401c49d7a02aa2a8573234",
"feedback": "Service was satisfactory.",
"rating": 4,
"sentiment": "0.7274972",
"level": "Moderate",
"desc": "Staff was responsive and resolved the issue efficiently."
}

with the help of this

create singleDept and crossDept testing data 1 for both

in same format

should look like indian train complaints in english

trainNo will always be same
