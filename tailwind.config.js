export default { content: ['./index.html','./src/**/*.{js,jsx}'],
 theme:{extend:{colors:{brand:{DEFAULT:'#16A34A',dark:'#15803D',soft:'#F0FDF4'},ink:'#111827'},
 fontFamily:{sans:['"Plus Jakarta Sans"','system-ui','sans-serif']},
 keyframes:{fade:{from:{opacity:0,transform:'translateY(8px)'},to:{opacity:1,transform:'none'}}},animation:{fade:'fade .35s ease-out'}}},plugins:[] }
