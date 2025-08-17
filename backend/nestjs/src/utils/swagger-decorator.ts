import { applyDecorators } from "@nestjs/common";
import {
  ApiBody as SwaggerApiBody,
  ApiBodyOptions,
  ApiConsumes,
  ApiParam,
  ApiParamOptions,
  ApiQueryOptions,
  ApiQuery as SwaggerApiQuery,
} from "@nestjs/swagger";

/**
 * Add Swagger decorator for API route parameters to display DTO
 * (NestJS default decorators don't show DTO)
 */
export function ApiParams(options?: Partial<ApiParamOptions>) {
  return ApiParam({
    name: "params",
    description: "Route path parameters",
    required: true,
    ...options,
  });
}

/**
 * Add Swagger decorator for API query parameters to display DTO
 * (NestJS default decorators don't show DTO)
 */
export function ApiQuery(options?: ApiQueryOptions) {
  return SwaggerApiQuery({
    name: "query",
    description: "Route query parameters",
    required: true,
    ...options,
  });
}

/**
 * Add Swagger decorator for file uploads (e.g., images) to display in Swagger UI
 * Supports @UploadedFile decorator
 */
export function ApiFile(fieldname: string, options?: ApiBodyOptions) {
  return applyDecorators(
    ApiConsumes("multipart/form-data"),
    SwaggerApiBody({
      ...options,
    }),
  );
}
