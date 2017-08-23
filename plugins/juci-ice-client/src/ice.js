UCI.$registerConfig("ice");

UCI.ice.$registerSectionType("ice", {
	"enabled":          { dvalue: 1, type: Boolean },

});

UCI.ice.$registerSectionType("cloud", {
	"enabled":          { dvalue: 0, type: Boolean },
	"server":         	{ dvalue: "", type: String },
	"bik":         		{ dvalue: "", type: String },
});

