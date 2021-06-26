import { GL_CODE, Sub_GL_CODE } from "../../../constants";

export const createAllocationAccountString = (data, allocationChartField) => {
  // Segments that don't include the ones that used during allocation
  const otherSegments = data.segments
    .filter((s) => !data.metricSegments.map((ms) => ms._id).includes(s._id))
    .map((s) => {
      if (s.description === GL_CODE) {
        return {
          chartField: data.selectedAllocationSegment.segmentId,
          chartFieldOrder: s.chartFieldOrder,
        };
      } else if (s.description === Sub_GL_CODE) {
        return {
          chartField: data.subGLSegment.allocations.segmentId,
          chartFieldOrder: s.chartFieldOrder,
        };
      } else if (data.otherSegments.map((os) => os._id).includes(s._id)) {
        return {
          chartField: data.otherSegments.find((os) => os._id === s._id)
            .selectedSubSegment.segmentId,
          chartFieldOrder: s.chartFieldOrder,
        };
      }
    });

  // The Allocation Chart Field with the first segment's order number
  const allocationChartFieldWithOrder = {
    chartField: allocationChartField,
    chartFieldOrder: data.metricSegments[0].chartFieldOrder,
  };

  // All selected segments with their chartfield, ordered
  const combinedSegments = [
    ...otherSegments,
    allocationChartFieldWithOrder,
  ].sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);

  return combinedSegments.map((cs) => cs.chartField).join("-");
};

export const createBalanceAccountString = (data) => {
  const segments = data.segments
    .map((s) => {
      if (s.description === Sub_GL_CODE) {
        return {
          chartField: data.subGLSegment.balance.segmentId,
          chartFieldOrder: s.chartFieldOrder,
        };
      } else if (
        data.selectedBalanceSegments.map((bs) => bs._id).includes(s._id)
      ) {
        return {
          chartField: data.selectedBalanceSegments.find(
            (bs) => bs._id === s._id
          ).selectedSubSegment.segmentId,
          chartFieldOrder: s.chartFieldOrder,
        };
      }
    })
    .sort((a, b) => a.chartFieldOrder - b.chartFieldOrder);

  return segments.map((s) => s.chartField).join("-");
};
